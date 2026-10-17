<?php

namespace App\Models;

use App\Enums\CertificateStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Certificate extends Model
{
    protected $fillable = [
        'legacy_id', 'trainee_id', 'certificate_number', 'status', 'issued_at',
        'issued_by', 'file_id', 'revoked_at', 'revoked_by',
    ];

    protected function casts(): array
    {
        return [
            'status' => CertificateStatus::class,
            'issued_at' => 'datetime',
            'revoked_at' => 'datetime',
        ];
    }

    public function trainee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'trainee_id');
    }

    public function file(): BelongsTo
    {
        return $this->belongsTo(StoredFile::class, 'file_id');
    }

    public function issuer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'issued_by');
    }
}
