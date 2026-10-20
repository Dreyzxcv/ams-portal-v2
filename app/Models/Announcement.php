<?php

namespace App\Models;

use App\Enums\DiscordDeliveryStatus;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Announcement extends Model
{
    use HasFactory;

    // Publishing / Discord fields are deliberately NOT mass assignable.
    protected $fillable = ['recipient', 'sender', 'subject', 'body', 'signature', 'created_by'];

    protected function casts(): array
    {
        return [
            'published_at' => 'datetime',
            'discord_attempted_at' => 'datetime',
            'discord_sent_at' => 'datetime',
            'discord_status' => DiscordDeliveryStatus::class,
        ];
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function scopePublished(Builder $query): Builder
    {
        return $query->whereNotNull('published_at');
    }

    public function isPublished(): bool
    {
        return $this->published_at !== null;
    }
}