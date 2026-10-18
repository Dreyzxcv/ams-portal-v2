<?php

namespace App\Services;

use App\Enums\Role;
use App\Models\TraineeProgress;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ProgressService
{
    public function __construct(private readonly AuditLogger $audit) {}

    /** @param array{current_phase: int, started_on?: ?string} $data */
    public function save(User $actor, User $trainee, array $data): void
    {
        DB::transaction(function () use ($actor, $trainee, $data) {
            if ($trainee->role !== Role::Trainee) {
                throw ValidationException::withMessages(['current_phase' => 'Progress can only be recorded for trainees.']);
            }

            $existing = TraineeProgress::query()->whereKey($trainee->id)->lockForUpdate()->first();

            $phaseFrom = $existing?->current_phase;
            $startFrom = $existing?->started_on?->toDateString();

            $phaseTo = (int) $data['current_phase'];
            $startTo = $data['started_on'] ?? null;

            if ($existing !== null && $phaseFrom === $phaseTo && $startFrom === $startTo) {
                return;
            }

            TraineeProgress::updateOrCreate(
                ['trainee_id' => $trainee->id],
                ['current_phase' => $phaseTo, 'started_on' => $startTo, 'updated_by' => $actor->id],
            );

            $this->audit->record('progress.updated', $actor, 'user', $trainee->id, [
                'phase_from' => $phaseFrom,
                'phase_to' => $phaseTo,
                'started_on_from' => $startFrom,
                'started_on_to' => $startTo,
            ]);
        });
    }
}