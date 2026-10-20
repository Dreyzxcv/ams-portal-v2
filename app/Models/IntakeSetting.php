<?php

namespace App\Models;

use App\Enums\IntakeStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class IntakeSetting extends Model
{
    public const SINGLETON_ID = 1;

    public $incrementing = false;

    protected $fillable = ['current_batch_id', 'status', 'updated_by'];

    protected function casts(): array
    {
        return ['status' => IntakeStatus::class];
    }

    /** The saved settings, or an unsaved "closed, no batch" default. */
    public static function current(): self
    {
        return static::query()->find(self::SINGLETON_ID)
            ?? new self(['status' => IntakeStatus::Closed]);
    }

    public function batch(): BelongsTo
    {
        return $this->belongsTo(Batch::class, 'current_batch_id');
    }

    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}