<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

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
}
