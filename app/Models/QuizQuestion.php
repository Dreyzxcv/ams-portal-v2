<?php

namespace App\Models;

use Carbon\CarbonImmutable;
use Database\Factories\QuizQuestionFactory;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property int $quiz_id
 * @property string $type
 * @property string $prompt
 * @property string $points
 * @property array<int, string>|null $options
 * @property int|null $correct_option
 * @property int $position
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read Quiz $quiz
 * @property-read Collection<int, QuizAnswer> $answers
 */
class QuizQuestion extends Model
{
    /** @use HasFactory<QuizQuestionFactory> */
    use HasFactory;

    protected $fillable = ['quiz_id', 'type', 'prompt', 'points', 'options', 'correct_option', 'position'];

    protected function casts(): array
    {
        return ['points' => 'decimal:2', 'options' => 'array'];
    }

    /** @return BelongsTo<Quiz, $this> */
    public function quiz(): BelongsTo
    {
        return $this->belongsTo(Quiz::class);
    }

    /** @return HasMany<QuizAnswer, $this> */
    public function answers(): HasMany
    {
        return $this->hasMany(QuizAnswer::class);
    }
}
