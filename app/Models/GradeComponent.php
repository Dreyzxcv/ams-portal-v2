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

    public function isPassing(float|int|string $score): bool
    {
        return (float) $score >= (float) $this->pass_score;
    }

    /** @return HasOne<Quiz, $this> */
    public function quiz(): HasOne
    {
        return $this->hasOne(Quiz::class, 'grade_component_key', 'key');
    }
}
