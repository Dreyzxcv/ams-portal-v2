<?php

namespace App\Models;

use Carbon\CarbonImmutable;
use Database\Factories\QuizFactory;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property string $grade_component_key
 * @property string $title
 * @property string $instructions
 * @property int $duration_minutes
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read GradeComponent $gradeComponent
 * @property-read Collection<int, QuizQuestion> $questions
 */
class Quiz extends Model
{
    /** @use HasFactory<QuizFactory> */
    use HasFactory;

    protected $fillable = ['grade_component_key', 'title', 'instructions', 'duration_minutes'];

    /** @return BelongsTo<GradeComponent, $this> */
    public function gradeComponent(): BelongsTo
    {
        return $this->belongsTo(GradeComponent::class, 'grade_component_key', 'key');
    }

    /** @return HasMany<QuizQuestion, $this> */
    public function questions(): HasMany
    {
        return $this->hasMany(QuizQuestion::class)->orderBy('position');
    }

    /** @return HasMany<QuizAccess, $this> */
    public function accesses(): HasMany
    {
        return $this->hasMany(QuizAccess::class);
    }

    /** @return HasMany<QuizAttempt, $this> */
    public function attempts(): HasMany
    {
        return $this->hasMany(QuizAttempt::class);
    }
}
