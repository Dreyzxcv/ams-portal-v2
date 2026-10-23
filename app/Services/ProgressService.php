<?php

namespace App\Services;

use App\Enums\Role;
use App\Models\TraineeProgress;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use App\Events\BatchAssignmentChanged;

class ProgressService
{
    public function __construct(private readonly AuditLogger $audit) {}

    /** @param array{current_phase: int} $data */
    public function save(User $actor, User $trainee, array $data): void
    {
        DB::transaction(function () use ($actor, $trainee, $data) {
            if ($trainee->role !== Role::Trainee) {
                throw ValidationException::withMessages(['current_phase' => 'Progress can only be recorded for trainees.']);
            }

            $existing = TraineeProgress::query()->whereKey($trainee->id)->lockForUpdate()->first();

            $phaseFrom = $existing?->current_phase;
            $phaseTo = (int) $data['current_phase'];

            if ($existing !== null && $phaseFrom === $phaseTo) {
                return;
            }

            TraineeProgress::updateOrCreate(
                ['trainee_id' => $trainee->id],
                ['current_phase' => $phaseTo, 'updated_by' => $actor->id],
            );

            $this->audit->record('progress.updated', $actor, 'user', $trainee->id, [
                'phase_from' => $phaseFrom,
                'phase_to' => $phaseTo,
            ]);

            BatchAssignmentChanged::dispatch($trainee->id);
        });
    }
}