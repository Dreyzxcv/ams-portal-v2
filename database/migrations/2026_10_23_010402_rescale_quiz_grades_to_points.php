<?php

use App\Models\GradeComponent;
use App\Models\GradeRecord;
use App\Models\GradeRevision;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::transaction(function (): void {
            foreach (GradeComponent::query()->whereIn('key', GradeComponent::QUIZ_KEYS)->get() as $component) {
                $quiz = Quiz::query()->where('grade_component_key', $component->key)->first();
                $total = $quiz ? (float) $quiz->questions()->sum('points') : 0.0;

                if ($quiz === null || $total <= 0) {
                    continue;
                }

                $max = (float) $component->max_score;
                $reviewed = QuizAttempt::query()
                    ->where('quiz_id', $quiz->id)
                    ->whereNotNull('reviewed_at')
                    ->get()
                    ->keyBy('trainee_id');

                foreach (GradeRecord::query()->where('component_id', $component->id)->whereNotNull('score')->get() as $record) {
                    $old = (float) $record->score;
                    $attempt = $reviewed->get($record->trainee_id);

                    // Untouched quiz-derived grade -> exact raw points; manual overrides -> proportional.
                    $new = ($attempt && (float) $attempt->final_score === $old)
                        ? round((float) $attempt->auto_score + (float) $attempt->manual_score, 2)
                        : round(($old / $max) * $total, 2);

                    if ($new === round($old, 2)) {
                        continue;
                    }

                    $record->update(['score' => number_format($new, 2, '.', '')]);

                    GradeRevision::create([
                        'grade_record_id' => $record->id,
                        'old_score' => number_format($old, 2, '.', ''),
                        'new_score' => number_format($new, 2, '.', ''),
                        'changed_by' => null,
                        'changed_at' => now(),
                        'reason' => 'Converted to quiz points (out of '.rtrim(rtrim(number_format($total, 2, '.', ''), '0'), '.').')',
                    ]);
                }

                foreach ($reviewed as $attempt) {
                    $attempt->update([
                        'final_score' => number_format((float) $attempt->auto_score + (float) $attempt->manual_score, 2, '.', ''),
                    ]);
                }
            }
        });
    }

    public function down(): void
    {
        // Not reversible without the original scaled values.
    }
};