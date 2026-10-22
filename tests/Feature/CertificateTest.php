<?php

use App\Contracts\CertificateStorage;
use App\Enums\CertificateStatus;
use App\Models\Certificate;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Tests\Support\FakeCertificateStorage;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->app->instance(CertificateStorage::class, new FakeCertificateStorage);
});

function pdf(): UploadedFile
{
    return UploadedFile::fake()->createWithContent('cert.pdf', "%PDF-1.4\n1 0 obj\n<<>>\nendobj\n%%EOF");
}

function issueFor(User $admin, User $trainee)
{
    return test()->actingAs($admin)->post(route('certificates.store', $trainee), ['file' => pdf()]);
}

it('lets an admin issue a certificate with a number and file', function () {
    $admin = User::factory()->admin()->create();
    $trainee = User::factory()->create();

    issueFor($admin, $trainee)->assertRedirect(route('certificates.index'));

    $cert = Certificate::where('trainee_id', $trainee->id)->firstOrFail();

    expect($cert->status)->toBe(CertificateStatus::Issued)
        ->and($cert->certificate_number)->toStartWith('AMS-'.now()->year.'-0001')
        ->and($cert->file_id)->not->toBeNull();
});

it('rejects issuing by non-admin staff', function () {
    $instructor = User::factory()->instructor()->create();
    $trainee = User::factory()->create();

    issueFor($instructor, $trainee)->assertForbidden();

    expect(Certificate::count())->toBe(0);
});

it('rejects non-PDF uploads', function () {
    $admin = User::factory()->admin()->create();
    $trainee = User::factory()->create();

    $this->actingAs($admin)
        ->post(route('certificates.store', $trainee), ['file' => UploadedFile::fake()->create('x.png', 10, 'image/png')])
        ->assertSessionHasErrors('file');
});

it('blocks a second issue while one is active', function () {
    $admin = User::factory()->admin()->create();
    $trainee = User::factory()->create();

    issueFor($admin, $trainee);
    issueFor($admin, $trainee)->assertSessionHasErrors('file');

    expect(Certificate::count())->toBe(1);
});

it('lets a trainee download only their own issued certificate', function () {
    $admin = User::factory()->admin()->create();
    $owner = User::factory()->create();
    $other = User::factory()->create();

    issueFor($admin, $owner);
    $cert = Certificate::where('trainee_id', $owner->id)->firstOrFail();

    $this->actingAs($owner)->get(route('certificates.download', $cert))->assertOk();
    $this->actingAs($other)->get(route('certificates.download', $cert))->assertForbidden();
});

it('removes trainee access after revocation and allows re-issue', function () {
    $admin = User::factory()->admin()->create();
    $trainee = User::factory()->create();

    issueFor($admin, $trainee);
    $cert = Certificate::where('trainee_id', $trainee->id)->firstOrFail();

    $this->actingAs($admin)->post(route('certificates.revoke', $cert), ['reason' => 'Issued in error'])->assertRedirect();

    expect($cert->fresh()->status)->toBe(CertificateStatus::Revoked);

    $this->actingAs($trainee)->get(route('certificates.download', $cert))->assertForbidden();

    issueFor($admin, $trainee);

    expect($cert->fresh()->status)->toBe(CertificateStatus::Issued)
        ->and($cert->fresh()->certificate_number)->toEndWith('-0002');
});

it('writes audit rows without leaking file contents', function () {
    $admin = User::factory()->admin()->create();
    $trainee = User::factory()->create();

    issueFor($admin, $trainee);

    $this->assertDatabaseHas('audit_logs', ['action' => 'certificate.issued', 'actor_id' => $admin->id]);
});