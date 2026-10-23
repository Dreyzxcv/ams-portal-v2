<?php

namespace App\Services;

use App\Enums\Role;
use App\Models\Batch;
use App\Models\BatchAssignment;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use App\Events\BatchAssignmentChanged;
use App\Models\TraineeProgress;

class BatchService
{
    public function __construct(private readonly AuditLogger $audit) {}

    /** @param array{name: string, starts_on?: ?string, ends_on?: ?string} $data */
    public function create(User $actor, array $data): Batch
    {
        return DB::transaction(function () use ($actor, $data) {
            $batch = Batch::create([
                'name' => $data['name'],
                'starts_on' => $data['starts_on'] ?? null,
                'ends_on' => $data['ends_on'] ?? null,
            ]);

            $this->audit->record('batch.created', $actor, 'batch', $batch->id, ['name' => $batch->name]);

            return $batch;
        });
    }

    /** @param array{name: string, starts_on?: ?string, ends_on?: ?string} $data */
    public function update(User $actor, Batch $batch, array $data): void
    {
        DB::transaction(function () use ($actor, $batch, $data) {
            $batch->fill([
                'name' => $data['name'],
                'starts_on' => $data['starts_on'] ?? null,
                'ends_on' => $data['ends_on'] ?? null,
            ]);

            $changed = array_keys($batch->getDirty());

            if ($changed === []) {
                return;
            }

            $batch->save();

            $this->audit->record('batch.updated', $actor, 'batch', $batch->id, ['fields' => $changed]);

            $batch->activeAssignments()->pluck('user_id')
                ->each(fn ($id) => BatchAssignmentChanged::dispatch((int) $id));
        });
    }

    public function delete(User $actor, Batch $batch): void
    {
        DB::transaction(function () use ($actor, $batch) {
            if ($batch->activeAssignments()->lockForUpdate()->exists()) {
                throw ValidationException::withMessages([
                    'batch' => 'Remove all trainees from this batch before deleting it.',
                ]);
            }

            $batch->delete();

            $this->audit->record('batch.deleted', $actor, 'batch', $batch->id, ['name' => $batch->name]);
        });
    }

    /** Assigns a trainee. If they are in another batch, they are moved (transfer). */
    public function assign(User $actor, Batch $batch, User $trainee): void
    {
        DB::transaction(function () use ($actor, $batch, $trainee) {
            if ($trainee->role !== Role::Trainee || ! $trainee->isActive()) {
                throw ValidationException::withMessages([
                    'user_id' => 'Only active trainees can be assigned to a batch.',
                ]);
            }

            $current = BatchAssignment::query()
                ->where('user_id', $trainee->id)
                ->whereNull('unassigned_at')
                ->lockForUpdate()
                ->first();

            if ($current !== null && $current->batch_id === $batch->id) {
                return;
            }

            if ($current !== null) {
                $current->forceFill(['unassigned_at' => now()])->save();

                $this->audit->record('batch.trainee_unassigned', $actor, 'batch', $current->batch_id, [
                    'trainee_id' => $trainee->id,
                    'reason' => 'transferred',
                ]);
            }

            BatchAssignment::create([
                'batch_id' => $batch->id,
                'user_id' => $trainee->id,
                'assigned_at' => now(),
                'assigned_by' => $actor->id,
            ]);

            $this->audit->record('batch.trainee_assigned', $actor, 'batch', $batch->id, [
                'trainee_id' => $trainee->id,
                'from_batch_id' => $current?->batch_id,
            ]);

            TraineeProgress::firstOrCreate(
                ['trainee_id' => $trainee->id],
                ['current_phase' => 1, 'updated_by' => $actor->id],
            );

            BatchAssignmentChanged::dispatch($trainee->id);
        });
    }

    public function unassign(User $actor, Batch $batch, BatchAssignment $assignment): void
    {
        DB::transaction(function () use ($actor, $batch, $assignment) {
            if ($assignment->batch_id !== $batch->id || $assignment->unassigned_at !== null) {
                return;
            }

            $assignment->forceFill(['unassigned_at' => now()])->save();

            $this->audit->record('batch.trainee_unassigned', $actor, 'batch', $batch->id, [
                'trainee_id' => $assignment->user_id,
                'reason' => 'removed',
            ]);

            BatchAssignmentChanged::dispatch($assignment->user_id);
        });
    }
}
