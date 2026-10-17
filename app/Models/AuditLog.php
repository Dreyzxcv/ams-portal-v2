<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AuditLog extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'occurred_at', 'actor_id', 'actor_username', 'actor_role', 'action',
        'subject_type', 'subject_id', 'details', 'ip_address', 'user_agent',
    ];

    protected function casts(): array
    {
        return ['occurred_at' => 'datetime', 'details' => 'array'];
    }

    public function actor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'actor_id');
    }
}
