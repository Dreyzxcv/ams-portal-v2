<?php

namespace App\Http\Controllers;

use App\Http\Requests\AnnouncementRequest;
use App\Models\Announcement;
use App\Services\AnnouncementPublisher;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class AnnouncementController extends Controller
{
    public function __construct(private AnnouncementPublisher $publisher) {}

    public function index(): Response
    {
        Gate::authorize('viewAny', Announcement::class);

        $announcements = Announcement::query()
            ->with('author:id,name')
            ->orderByDesc('created_at')->orderByDesc('id')
            ->simplePaginate(20)
            ->through(fn (Announcement $a) => $this->present($a));

        return Inertia::render('announcements/index', ['announcements' => $announcements]);
    }

    public function create(): Response
    {
        Gate::authorize('create', Announcement::class);

        return Inertia::render('announcements/create');
    }

    public function store(AnnouncementRequest $request): RedirectResponse
    {
        $announcement = Announcement::create([
            ...$request->safe()->only(['recipient', 'sender', 'subject', 'body', 'signature']),
            'created_by' => $request->user()->id,
        ]);

        if ($request->boolean('publish')) {
            $announcement = $this->publisher->publish($announcement);
        }

        return to_route('announcements.index')->with('status', $this->statusMessage($announcement));
    }

    public function edit(Announcement $announcement): Response
    {
        Gate::authorize('update', $announcement);

        return Inertia::render('announcements/edit', ['announcement' => $this->present($announcement)]);
    }

    public function update(AnnouncementRequest $request, Announcement $announcement): RedirectResponse
    {
        $announcement->update($request->safe()->only(['recipient', 'sender', 'subject', 'body', 'signature']));

        if ($request->boolean('publish')) {
            $announcement = $this->publisher->publish($announcement);
        }

        return to_route('announcements.index')->with('status', $this->statusMessage($announcement, 'Announcement saved.'));
    }

    public function destroy(Announcement $announcement): RedirectResponse
    {
        Gate::authorize('delete', $announcement);

        $announcement->delete();

        return to_route('announcements.index')->with('status', 'Announcement removed.');
    }

    public function publish(Announcement $announcement): RedirectResponse
    {
        Gate::authorize('publish', $announcement);

        $announcement = $this->publisher->publish($announcement);

        return back()->with('status', $this->statusMessage($announcement));
    }

    public function unpublish(Announcement $announcement): RedirectResponse
    {
        Gate::authorize('unpublish', $announcement);

        $this->publisher->unpublish($announcement);

        return back()->with('status', 'Announcement unpublished.');
    }

    public function retry(Announcement $announcement): RedirectResponse
    {
        Gate::authorize('retryDiscord', $announcement);

        abort_unless($announcement->isPublished(), 422, 'Only published announcements can be sent to Discord.');

        $announcement = $this->publisher->sendToDiscord($announcement);

        return back()->with('status', $this->statusMessage($announcement));
    }

    public function pin(Announcement $announcement): RedirectResponse
    {
        Gate::authorize('pin', $announcement);

        abort_unless($announcement->isPublished(), 422, 'Only published announcements can be pinned.');

        if (! $announcement->isPinned()) {
            $announcement->forceFill(['pinned_at' => now()])->save();
        }

        return back();
    }

    public function unpin(Announcement $announcement): RedirectResponse
    {
        Gate::authorize('unpin', $announcement);

        $announcement->forceFill(['pinned_at' => null])->save();

        return back();
    }

    private function statusMessage(Announcement $a, string $default = 'Announcement saved.'): string
    {
        if (! $a->isPublished()) {
            return $default;
        }

        return $a->discord_status->value === 'failed'
            ? "Published in the portal, but Discord delivery failed: {$a->discord_error} Use “Retry Discord” to try again."
            : 'Announcement published.';
    }

    private function present(Announcement $a): array
    {
        return [
            'id' => $a->id,
            'recipient' => $a->recipient,
            'sender' => $a->sender,
            'subject' => $a->subject,
            'body' => $a->body,
            'signature' => $a->signature,
            'is_published' => $a->isPublished(),
            'is_pinned' => $a->isPinned(),
            'published_label' => Announcement::displayLabel($a->published_at),
            'author' => $a->author?->name,
            'discord_status' => $a->discord_status->value,
            'discord_error' => $a->discord_error,
            'discord_sent_label' => Announcement::displayLabel($a->discord_sent_at),
        ];
    }
}