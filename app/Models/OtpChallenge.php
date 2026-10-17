<?php

namespace App\Models;

use App\Enums\OtpPurpose;
use Illuminate\Database\Eloquent\Model;

class OtpChallenge extends Model
{
    public const UPDATED_AT = null;

    protected $fillable = ['user_id', 'purpose', 'code_hash', 'expires_at', 'consumed_at', 'attempts', 'ip_address'];

    protected $hidden = ['code_hash'];

    protected function casts(): array
    {
        return ['purpose' => OtpPurpose::class, 'expires_at' => 'datetime', 'consumed_at' => 'datetime'];
    }
}
