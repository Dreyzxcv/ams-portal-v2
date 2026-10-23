<?php

namespace App\Services;

use App\Enums\DiscordDeliveryStatus as Status;
use App\Events\AnnouncementsChanged;
use App\Models\Announcement;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Throwable;

class AnnouncementPublisher
{
    public function publish(Announcement $announcement): Announcement
    {
        if (! $announcement->isPublished()) {
            $announcement->forceFill(['published_at' => now()])->save();
            event(new AnnouncementsChanged(true));
        }

        return $this->sendToDiscord($announcement);
    }

    public function unpublish(Announcement $announcement): void
    {
        // The portal copy is hidden; a message already in Discord is not deleted.
        $announcement->forceFill(['published_at' => null])->save();
        event(new AnnouncementsChanged(true));
    }

    /**
     * Idempotent: already-sent announcements are never re-posted, and a
     * concurrent attempt can't double-post (atomic claim).
     */
    public function sendToDiscord(Announcement $announcement): Announcement
    {
        if (! $announcement->isPublished() || ! $this->claim($announcement)) {
            return $announcement->refresh();
        }

        event(new AnnouncementsChanged);

        try {
            $url = (string) config('services.discord.announcements_webhook_url');

            if (! $this->isWebhookUrl($url)) {
                return $this->fail($announcement, 'The Discord webhook is not configured.');
            }

            // No automatic retry: a timeout after Discord accepted the post would duplicate it.
            $response = Http::timeout(8)->connectTimeout(4)
                ->withOptions(['force_ip_resolve' => 'v4'])
                ->asJson()
                ->post($url, $this->payload($announcement));
            if ($response->failed()) {
                return $this->fail($announcement, "Discord rejected the post (HTTP {$response->status()}).");
            }

            $announcement->forceFill([
                'discord_status' => Status::Sent,
                'discord_sent_at' => now(),
                'discord_error' => null,
            ])->save();
            event(new AnnouncementsChanged);
        } catch (ConnectionException $e) {
            $safe = preg_replace('#/api/webhooks/\S+#', '/api/webhooks/[redacted]', $e->getMessage());
            Log::warning('Discord connection error', ['announcement_id' => $announcement->getKey(), 'detail' => $safe]);

            return $this->fail($announcement, 'Could not reach Discord (network error or timeout).');
        } catch (Throwable $e) {
            return $this->fail($announcement, 'Unexpected error while contacting Discord.', $e);
        }

        return $announcement->refresh();
    }

    private function claim(Announcement $announcement): bool
    {
        return Announcement::query()
            ->whereKey($announcement->getKey())
            ->where(function ($q) {
                $q->whereIn('discord_status', [Status::NotSent->value, Status::Failed->value])
                    ->orWhere(fn ($q) => $q->where('discord_status', Status::Sending->value)
                        ->where('discord_attempted_at', '<', now()->subMinute())); // stuck attempt
            })
            ->update([
                'discord_status' => Status::Sending->value,
                'discord_attempted_at' => now(),
                'discord_error' => null,
            ]) === 1;
    }

    private function fail(Announcement $announcement, string $reason, ?Throwable $e = null): Announcement
    {
        // Never log exception messages/URLs: Guzzle errors can contain the webhook URL.
        Log::warning('Discord announcement delivery failed', [
            'announcement_id' => $announcement->getKey(),
            'reason' => $reason,
            'exception' => $e ? $e::class : null,
        ]);

        $announcement->forceFill(['discord_status' => Status::Failed, 'discord_error' => $reason])->save();
        event(new AnnouncementsChanged);

        return $announcement->refresh();
    }

    private function isWebhookUrl(string $url): bool
    {
        return (bool) preg_match('#^https://(?:(?:canary|ptb)\.)?discord(?:app)?\.com/api/webhooks/\d+/[\w-]+$#', $url);
    }

    private function payload(Announcement $a): array
    {
        $description = Str::limit(
            "**TO:** {$a->recipient}\n**FROM:** {$a->sender}\n**RE:** {$a->subject}\n\n{$a->body}\n\n— {$a->signature}",
            4000,
        );

        return [
            'allowed_mentions' => ['parse' => []], // user text can't ping @everyone/roles
            'embeds' => [[
                'title' => 'Army Medical School — Announcement',
                'description' => $description,
                'color' => 0x0284C7,
                'timestamp' => $a->published_at->toIso8601String(),
            ]],
        ];
    }
}
