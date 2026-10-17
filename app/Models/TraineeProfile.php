<?php

namespace App\Models;

use App\Enums\TraineeLifecycle;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TraineeProfile extends Model
{
    protected $primaryKey = 'user_id';

    public $incrementing = false;

    protected $fillable = ['user_id', 'lifecycle', 'graduated_on', 'discharged_on', 'notes'];

    protected function casts(): array
    {
        return [
            'lifecycle' => TraineeLifecycle::class,
            'graduated_on' => 'date',
            'discharged_on' => 'date',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
