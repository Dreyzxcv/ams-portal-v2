<?php

use App\Models\AuditLog;
use App\Models\Batch;
use App\Models\BatchAssignment;
use App\Models\Certificate;
use App\Models\ChainOfCommandEntry;
use App\Models\GradeComponent;
use App\Models\GradeRecord;
use App\Models\TraineeProgress;
use App\Models\User;
use App\Models\Violation;
use App\Support\Permissions;
use Database\Seeders\GradeComponentSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('grants each role exactly the documented permissions', function (string $role, array $expected) {
    $user = User::factory()->create(['role' => $role]);

    $granted = array_values(array_filter(
        Permissions::all(),
        fn (string $permission) => Permissions::allows($user, $permission),
    ));

    expect($granted)->toEqualCanonicalizing($expected);
})->with([
    'admin' => ['admin', [
        'users.manage', 'grades.view_all', 'grades.manage', 'violations.manage',
        'progress.manage', 'batches.view', 'batches.manage', 'certificates.manage',
        'chain.manage', 'logs.view', 'settings.manage', 'announcements.manage', 'quizzes.manage',
    ]],
    'head instructor' => ['head_instructor', [
        'grades.view_all', 'grades.manage', 'quizzes.manage', 'violations.manage',
        'progress.manage', 'batches.view', 'announcements.manage',
    ]],
    'instructor' => ['instructor', ['grades.view_all', 'grades.manage', 'batches.view']],
    'logistic officer' => ['logistic_officer', ['grades.view_all', 'violations.manage', 'progress.manage']],
    'trainee' => ['trainee', []],
]);

it('grants nothing to inactive or suspended accounts, even admins', function () {
    foreach ([User::factory()->admin()->inactive()->create(), User::factory()->admin()->suspended()->create()] as $user) {
        foreach (Permissions::all() as $permission) {
            expect(Permissions::allows($user, $permission))->toBeFalse();
        }
    }
});

it('limits user management to admins and blocks self role and status changes', function () {
    $admin = User::factory()->admin()->create();
    $other = User::factory()->create();

    expect($admin->can('viewAny', User::class))->toBeTrue()
        ->and($admin->can('changeStatus', $other))->toBeTrue()
        ->and($admin->can('changeRole', $other))->toBeTrue()
        ->and($admin->can('changeStatus', $admin))->toBeFalse()
        ->and($admin->can('changeRole', $admin))->toBeFalse();

    foreach ([User::factory()->headInstructor()->create(), User::factory()->instructor()->create(), User::factory()->logisticOfficer()->create(), $other] as $user) {
        expect($user->can('viewAny', User::class))->toBeFalse()
            ->and($user->can('create', User::class))->toBeFalse()
            ->and($user->can('update', $admin))->toBeFalse();
    }
});

it('applies the grade rules per role and ownership', function () {
    $this->seed(GradeComponentSeeder::class);

    $a = User::factory()->create();
    $b = User::factory()->create();
    $record = GradeRecord::create([
        'trainee_id' => $a->id,
        'component_id' => GradeComponent::first()->id,
        'score' => 20,
    ]);

    expect($a->can('view', $record))->toBeTrue()
        ->and($b->can('view', $record))->toBeFalse()
        ->and($a->can('update', $record))->toBeFalse()
        ->and(User::factory()->instructor()->create()->can('update', $record))->toBeTrue()
        ->and(User::factory()->headInstructor()->create()->can('update', $record))->toBeTrue()
        ->and(User::factory()->logisticOfficer()->create()->can('view', $record))->toBeTrue()
        ->and(User::factory()->logisticOfficer()->create()->can('update', $record))->toBeFalse();
});

it('applies the violation rules per role and ownership', function () {
    $a = User::factory()->create();
    $b = User::factory()->create();
    $violation = Violation::create([
        'trainee_id' => $a->id,
        'occurred_on' => now()->toDateString(),
        'description' => 'Late to formation',
    ]);

    expect($a->can('view', $violation))->toBeTrue()
        ->and($b->can('view', $violation))->toBeFalse()
        ->and($a->can('update', $violation))->toBeFalse()
        ->and(User::factory()->logisticOfficer()->create()->can('create', Violation::class))->toBeTrue()
        ->and(User::factory()->headInstructor()->create()->can('delete', $violation))->toBeTrue()
        ->and(User::factory()->instructor()->create()->can('create', Violation::class))->toBeFalse();
});

it('shows a trainee only their own certificate and only once issued', function () {
    $a = User::factory()->create();
    $b = User::factory()->create();

    $pending = Certificate::create(['trainee_id' => $a->id, 'status' => 'pending']);

    expect($a->can('view', $pending))->toBeFalse()
        ->and(User::factory()->admin()->create()->can('view', $pending))->toBeTrue();

    $pending->update([
        'status' => 'issued',
        'certificate_number' => 'AMS-0001',
        'issued_at' => now(),
    ]);

    expect($a->can('download', $pending->fresh()))->toBeTrue()
        ->and($b->can('download', $pending->fresh()))->toBeFalse()
        ->and(User::factory()->instructor()->create()->can('view', $pending->fresh()))->toBeFalse();
});

it('applies the batch rules', function () {
    $batch = Batch::create(['name' => 'Alpha']);
    $member = User::factory()->create();
    $outsider = User::factory()->create();
    BatchAssignment::create(['batch_id' => $batch->id, 'user_id' => $member->id]);

    expect($member->can('view', $batch))->toBeTrue()
        ->and($outsider->can('view', $batch))->toBeFalse()
        ->and(User::factory()->instructor()->create()->can('view', $batch))->toBeTrue()
        ->and(User::factory()->instructor()->create()->can('update', $batch))->toBeFalse()
        ->and(User::factory()->admin()->create()->can('assign', $batch))->toBeTrue()
        // Open question: V1 gave Logistic Officers no batch page. Change deliberately if confirmed otherwise.
        ->and(User::factory()->logisticOfficer()->create()->can('viewAny', Batch::class))->toBeFalse();
});

it('applies the progress rules', function () {
    $a = User::factory()->create();
    $b = User::factory()->create();
    $progress = TraineeProgress::create(['trainee_id' => $a->id]);

    expect($a->can('view', $progress))->toBeTrue()
        ->and($b->can('view', $progress))->toBeFalse()
        ->and($a->can('update', $progress))->toBeFalse()
        ->and(User::factory()->logisticOfficer()->create()->can('update', $progress))->toBeTrue()
        ->and(User::factory()->instructor()->create()->can('update', $progress))->toBeFalse();
});

it('restricts audit logs to admins and never allows edits', function () {
    $log = AuditLog::create(['occurred_at' => now(), 'action' => 'test.event']);
    $admin = User::factory()->admin()->create();

    expect($admin->can('viewAny', AuditLog::class))->toBeTrue()
        ->and($admin->can('update', $log))->toBeFalse()
        ->and($admin->can('delete', $log))->toBeFalse()
        ->and(User::factory()->headInstructor()->create()->can('viewAny', AuditLog::class))->toBeFalse()
        ->and(User::factory()->create()->can('viewAny', AuditLog::class))->toBeFalse();
});

it('lets only admins edit the chain of command', function () {
    $entry = ChainOfCommandEntry::create(['name' => 'A. Person', 'rank' => 'Captain', 'position' => 'Commander']);

    expect(User::factory()->admin()->create()->can('update', $entry))->toBeTrue()
        ->and(User::factory()->headInstructor()->create()->can('update', $entry))->toBeFalse()
        ->and(User::factory()->create()->can('create', ChainOfCommandEntry::class))->toBeFalse();
});
