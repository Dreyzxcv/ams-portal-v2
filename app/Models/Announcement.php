<?php

namespace App\Models;

use App\Enums\DiscordDeliveryStatus;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\CarbonInterface;

class Announcement extends Model
{
    use HasFactory;

    // Publishing / Discord fields are deliberately NOT mass assignable.
    protected $fillable = ['recipient', 'sender', 'subject', 'body', 'signature', 'created_by'];

    protected function casts(): array
    {
        return [
            'published_at' => 'datetime',
            'pinned_at' => 'datetime',
            'discord_attempted_at' => 'datetime',
            'discord_sent_at' => 'datetime',
            'discord_status' => DiscordDeliveryStatus::class,
        ];
    }

    public static function displayLabel(?CarbonInterface $date): ?string
    {
        return $date?->copy()
            ->timezone(config('app.display_timezone'))
            ->format('j M Y, H:i');
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

    public function scopeForPublicDisplay(Builder $query): Builder
    {
        return $query->published()
            ->orderByRaw('pinned_at is null')
            ->orderByDesc('published_at')
            ->orderByDesc('id');
    }

    public function isPinned(): bool
    {
        return $this->pinned_at !== null;
    }

    public function toPublicArray(): array
    {
        return [
            'id' => $this->id,
            'recipient' => $this->recipient,
            'sender' => $this->sender,
            'subject' => $this->subject,
            'body' => $this->body,
            'signature' => $this->signature,
            'published_label' => self::displayLabel($this->published_at),
            'is_pinned' => $this->isPinned(),
        ];
    }
}