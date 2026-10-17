<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GradeRevision extends Model
{
    public $timestamps = false;

    protected $fillable = ['grade_record_id', 'old_score', 'new_score', 'changed_by', 'changed_at', 'reason'];

    protected function casts(): array
    {
        return ['old_score' => 'decimal:2', 'new_score' => 'decimal:2', 'changed_at' => 'datetime'];
    }

    public function record(): BelongsTo
    {
        return $this->belongsTo(GradeRecord::class, 'grade_record_id');
    }

    public function changer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'changed_by');
    }
}
