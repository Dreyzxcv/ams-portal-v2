<?php

namespace App\Models;

use Carbon\CarbonImmutable;
use Database\Factories\QuizAccessFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $quiz_id
 * @property int $trainee_id
 * @property int|null $granted_by
 * @property CarbonImmutable $granted_at
 * @property CarbonImmutable|null $revoked_at
 * @property-read Quiz $quiz
 * @property-read User $trainee
 * @property-read User|null $grantor
 */
class QuizAccess extends Model
{
    /** @use HasFactory<QuizAccessFactory> */
    use HasFactory;

    protected $fillable = ['quiz_id', 'trainee_id', 'granted_by', 'granted_at', 'revoked_at'];

    protected function casts(): array
    {
        return ['granted_at' => 'datetime', 'revoked_at' => 'datetime'];
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
    public function grantor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'granted_by');
    }
}
