<?php

namespace App\Services;

use App\Enums\Role;
use App\Events\GradesChanged;
use App\Models\GradeComponent;
use App\Models\GradeRecord;
use App\Models\GradeRevision;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class GradeService
{
    public function __construct(private readonly AuditLogger $audit) {}

    public function save(User $actor, User $trainee, GradeComponent $component, float|string $score, ?string $reason): void
    {
        DB::transaction(function () use ($actor, $trainee, $component, $score, $reason) {
            if ($trainee->role !== Role::Trainee) {
                throw ValidationException::withMessages(['score' => 'Grades can only be recorded for trainees.']);
            }

            if (! $component->active) {
                throw ValidationException::withMessages(['score' => 'This grading component is no longer active.']);
            }

            $record = GradeRecord::query()
                ->where('trainee_id', $trainee->id)
                ->where('component_id', $component->id)
                ->lockForUpdate()
                ->first();

            $old = $record?->score;
            $new = number_format((float) $score, 2, '.', '');

            if ($old !== null && (float) $old === (float) $new) {
                return;
            }

            $reason = $reason !== null ? trim($reason) : null;

            if ($old !== null && ($reason === null || $reason === '')) {
                throw ValidationException::withMessages(['reason' => 'Give a reason when changing an existing score.']);
            }

            $record ??= new GradeRecord([
                'trainee_id' => $trainee->id,
                'component_id' => $component->id,
            ]);

            $record->fill(['score' => $new, 'graded_by' => $actor->id, 'graded_at' => now()])->save();

            GradeRevision::create([
                'grade_record_id' => $record->id,
                'old_score' => $old,
                'new_score' => $new,
                'changed_by' => $actor->id,
                'changed_at' => now(),
                'reason' => $reason === '' ? null : $reason,
            ]);

            $this->audit->record('grade.saved', $actor, 'user', $trainee->id, [
                'component' => $component->key,
                'old' => $old,
                'new' => $new,
            ]);

            event(new GradesChanged($trainee->id));
        });
    }

    public function clear(User $actor, User $trainee, GradeComponent $component, string $reason): bool
    {
        return DB::transaction(function () use ($actor, $trainee, $component, $reason): bool {
            $record = GradeRecord::query()
                ->where('trainee_id', $trainee->id)
                ->where('component_id', $component->id)
                ->lockForUpdate()
                ->first();

            if ($record === null || $record->score === null) {
                return false;
            }

            $old = $record->score;

            $record->forceFill(['score' => null, 'graded_by' => null, 'graded_at' => null])->save();

            GradeRevision::create([
                'grade_record_id' => $record->id,
                'old_score' => $old,
                'new_score' => null,
                'changed_by' => $actor->id,
                'changed_at' => now(),
                'reason' => $reason,
            ]);

            $this->audit->record('grade.cleared', $actor, 'user', $trainee->id, [
                'component' => $component->key,
                'old' => $old,
            ]);

            event(new GradesChanged($trainee->id));

            return true;
        });
    }
}
