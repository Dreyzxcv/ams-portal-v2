<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Batch extends Model
{
    use SoftDeletes;

    protected $fillable = ['legacy_id', 'name', 'starts_on'];

    protected function casts(): array
    {
        return ['starts_on' => 'date'];
    }

    public function assignments(): HasMany
    {
        return $this->hasMany(BatchAssignment::class);
    }

    public function activeAssignments(): HasMany
    {
        return $this->assignments()->whereNull('unassigned_at');
    }

    public function numberLabel(): string
    {
        $name = trim($this->name);
        $label = trim((string) preg_replace('/^batch\s*[-:#.]?\s*/i', '', $name));

        return $label === '' ? $name : $label;
    }
}
