<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;

/**
 * @property int $id
 * @property string $key
 * @property string $label
 * @property int $sequence
 * @property string $max_score
 * @property string $pass_score
 * @property bool $is_final
 * @property bool $active
 * @property-read Quiz|null $quiz
 */
class GradeComponent extends Model
{
    /** Components whose score comes from a quiz (max = quiz total points). */
    public const QUIZ_KEYS = ['phase_1', 'final_exam'];

    protected $fillable = ['key', 'label', 'sequence', 'max_score', 'pass_score', 'is_final', 'active'];

    protected function casts(): array
    {
        return [
            'max_score' => 'decimal:2',
            'pass_score' => 'decimal:2',
            'is_final' => 'boolean',
            'active' => 'boolean',
        ];
    }

    public function isQuizBased(): bool
    {
        return in_array($this->key, self::QUIZ_KEYS, true);
    }

    /** Sum of the quiz's question points, or null when not quiz-based / no scorable quiz yet. */
    public function quizTotalPoints(): ?float
    {
        if (! $this->isQuizBased()) {
            return null;
        }

        $quiz = $this->relationLoaded('quiz') ? $this->quiz : $this->quiz()->first();

        if ($quiz === null) {
            return null;
        }

        $total = (float) ($quiz->getAttribute('total_points') ?? $quiz->questions()->sum('points'));

        return $total > 0 ? $total : null;
    }

    public function effectiveMaxScore(): float
    {
        return $this->quizTotalPoints() ?? (float) $this->max_score;
    }

    public function effectivePassScore(): float
    {
        $total = $this->quizTotalPoints();

        if ($total === null) {
            return (float) $this->pass_score;
        }

        $passRatio = (float) $this->pass_score / (float) $this->max_score;

        return round($total * $passRatio, 2);
    }

    public function isPassing(float|int|string $score): bool
    {
        return round((float) $score, 2) >= $this->effectivePassScore();
    }

    /** @return HasOne<Quiz, $this> */
    public function quiz(): HasOne
    {
        return $this->hasOne(Quiz::class, 'grade_component_key', 'key');
    }
}