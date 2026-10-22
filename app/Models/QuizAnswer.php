<?php

namespace App\Models;

use Database\Factories\QuizAnswerFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $quiz_attempt_id
 * @property int $quiz_question_id
 * @property string|null $answer_text
 * @property int|null $selected_option
 * @property string|null $auto_score
 * @property string|null $manual_score
 * @property-read QuizAttempt $attempt
 * @property-read QuizQuestion $question
 */
class QuizAnswer extends Model
{
    /** @use HasFactory<QuizAnswerFactory> */
    use HasFactory;

    protected $fillable = [
        'quiz_attempt_id',
        'quiz_question_id',
        'answer_text',
        'selected_option',
        'auto_score',
        'manual_score',
    ];

    protected function casts(): array
    {
        return ['auto_score' => 'decimal:2', 'manual_score' => 'decimal:2'];
    }

    /** @return BelongsTo<QuizAttempt, $this> */
    public function attempt(): BelongsTo
    {
        return $this->belongsTo(QuizAttempt::class, 'quiz_attempt_id');
    }

    /** @return BelongsTo<QuizQuestion, $this> */
    public function question(): BelongsTo
    {
        return $this->belongsTo(QuizQuestion::class, 'quiz_question_id');
    }
}
