<?php

namespace App\Models;

use Carbon\CarbonImmutable;
use Database\Factories\QuizAttemptFactory;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property int $quiz_id
 * @property int $trainee_id
 * @property CarbonImmutable $started_at
 * @property CarbonImmutable $expires_at
 * @property CarbonImmutable|null $submitted_at
 * @property string|null $auto_score
 * @property string|null $manual_score
 * @property string|null $final_score
 * @property int|null $reviewed_by
 * @property CarbonImmutable|null $reviewed_at
 * @property-read Quiz $quiz
 * @property-read User $trainee
 * @property-read User|null $reviewer
 * @property-read Collection<int, QuizAnswer> $answers
 */
class QuizAttempt extends Model
{
    /** @use HasFactory<QuizAttemptFactory> */
    use HasFactory;

    protected $fillable = [
        'quiz_id',
        'trainee_id',
        'started_at',
        'expires_at',
        'submitted_at',
        'auto_score',
        'manual_score',
        'final_score',
        'reviewed_by',
        'reviewed_at',
    ];

    protected function casts(): array
    {
        return [
            'started_at' => 'datetime',
            'expires_at' => 'datetime',
            'submitted_at' => 'datetime',
            'auto_score' => 'decimal:2',
            'manual_score' => 'decimal:2',
            'final_score' => 'decimal:2',
            'reviewed_at' => 'datetime',
        ];
    }

    /** @return BelongsTo<Quiz, $this> */
    public function quiz(): BelongsTo
    {
        return $this->belongsTo(Quiz::class);
    }

    /** @return BelongsTo<User, $this> */
    public function trainee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'trainee_id');
    }

    /** @return BelongsTo<User, $this> */
    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    /** @return HasMany<QuizAnswer, $this> */
    public function answers(): HasMany
    {
        return $this->hasMany(QuizAnswer::class);
    }

    public function isSubmitted(): bool
    {
        return $this->submitted_at !== null;
    }

    public function isReviewed(): bool
    {
        return $this->reviewed_at !== null;
    }
}
