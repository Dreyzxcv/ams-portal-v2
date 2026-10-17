<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TraineeProgress extends Model
{
    protected $table = 'trainee_progress';

    protected $primaryKey = 'trainee_id';

    public $incrementing = false;

    protected $fillable = ['trainee_id', 'current_phase', 'started_on', 'updated_by'];

    protected function casts(): array
    {
        return ['started_on' => 'date'];
    }

    public function trainee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'trainee_id');
    }
}
