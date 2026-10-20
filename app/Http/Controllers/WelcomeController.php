<?php

namespace App\Http\Controllers;

use App\Models\Announcement;
use App\Services\IntakeService;
use Inertia\Inertia;
use Inertia\Response;

class WelcomeController extends Controller
{
    public function __invoke(IntakeService $intake): Response
    {
        $announcements = Announcement::published()
            ->orderByDesc('published_at')
            ->orderByDesc('id')
            ->limit(20)
            ->get()
            ->map(fn (Announcement $a) => [
                'id' => $a->id,
                'recipient' => $a->recipient,
                'sender' => $a->sender,
                'subject' => $a->subject,
                'body' => $a->body,
                'signature' => $a->signature,
                'published_label' => $a->published_at->format('j M Y, H:i'),
            ]);

        return Inertia::render('welcome', [
            'intake' => $intake->banner(),
            'announcements' => $announcements,
        ]);
    }
}