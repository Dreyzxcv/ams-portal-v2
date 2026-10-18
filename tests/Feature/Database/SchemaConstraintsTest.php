<?php

use App\Models\AuditLog;
use App\Models\Batch;
use App\Models\BatchAssignment;
use App\Models\Certificate;
use App\Models\GradeComponent;
use App\Models\User;
use Database\Seeders\GradeComponentSeeder;
use Illuminate\Database\Eloquent\MassAssignmentException;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;

uses(RefreshDatabase::class);

it('rejects usernames that differ only by case', function () {
    User::factory()->create(['username' => 'jdoe']);
    User::factory()->create(['username' => 'JDOE']);
})->throws(QueryException::class);

it('rejects an unknown role at the database level', function () {
    $user = User::factory()->create();

    DB::table('users')->where('id', $user->id)->update(['role' => 'wizard']);
})->throws(QueryException::class);

it('does not allow role to be mass assigned', function () {
    try {
        $user = new User([
            'name' => 'X',
            'username' => 'x1',
            'email' => 'x@example.test',
            'password' => 'a-long-test-password',
            'role' => 'admin',
        ]);
        $role = $user->role;
    } catch (MassAssignmentException) {
        $role = null;
    }

    expect($role)->toBeNull();
});

it('allows only one active batch per trainee', function () {
    $trainee = User::factory()->create();
    $a = Batch::create(['name' => 'Batch A']);
    $b = Batch::create(['name' => 'Batch B']);

    BatchAssignment::create(['batch_id' => $a->id, 'user_id' => $trainee->id]);
    BatchAssignment::create(['batch_id' => $b->id, 'user_id' => $trainee->id]);
})->throws(QueryException::class);

it('allows a new batch after the previous assignment is ended', function () {
    $trainee = User::factory()->create();
    $a = Batch::create(['name' => 'Batch A']);
    $b = Batch::create(['name' => 'Batch B']);

    $first = BatchAssignment::create(['batch_id' => $a->id, 'user_id' => $trainee->id]);
    $first->update(['unassigned_at' => now()->addMinute()]);
    BatchAssignment::create(['batch_id' => $b->id, 'user_id' => $trainee->id]);

    expect($trainee->activeBatchAssignment->batch_id)->toBe($b->id);
});

it('does not allow audit log rows to be updated or deleted', function () {
    $log = AuditLog::create(['occurred_at' => now(), 'action' => 'test.event']);

    expect(fn () => DB::transaction(
        fn () => DB::table('audit_logs')->where('id', $log->id)->update(['action' => 'tampered'])
    ))->toThrow(QueryException::class);

    expect(fn () => DB::transaction(
        fn () => DB::table('audit_logs')->where('id', $log->id)->delete()
    ))->toThrow(QueryException::class);
});

it('requires a number and issue date for an issued certificate', function () {
    $trainee = User::factory()->create();

    Certificate::create(['trainee_id' => $trainee->id, 'status' => 'issued']);
})->throws(QueryException::class);

it('seeds the six confirmed grading rules and is safe to re-run', function () {
    $this->seed(GradeComponentSeeder::class);
    $this->seed(GradeComponentSeeder::class);

    expect(GradeComponent::count())->toBe(6);

    $phase2 = GradeComponent::where('key', 'phase_2')->first();
    expect((float) $phase2->max_score)->toBe(50.0)
        ->and((float) $phase2->pass_score)->toBe(25.0);

    $final = GradeComponent::where('key', 'final_exam')->first();
    expect((float) $final->max_score)->toBe(100.0)
        ->and((float) $final->pass_score)->toBe(60.0)
        ->and($final->is_final)->toBeTrue();
});
