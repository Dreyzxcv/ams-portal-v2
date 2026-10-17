<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class GradeRecord extends Model
{
    protected $fillable = ['trainee_id', 'component_id', 'score', 'graded_by', 'graded_at'];

    protected function casts(): array
    {
        return ['score' => 'decimal:2', 'graded_at' => 'datetime'];
    }

    public function trainee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'trainee_id');
    }

    public function component(): BelongsTo
    {
        return $this->belongsTo(GradeComponent::class, 'component_id');
    }

    public function grader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'graded_by');
    }

    public function revisions(): HasMany
    {
        return $this->hasMany(GradeRevision::class);
    }
}
