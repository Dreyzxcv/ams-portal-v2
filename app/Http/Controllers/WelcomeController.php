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
        $announcements = Announcement::forPublicDisplay()
            ->limit(3)
            ->get()
            ->map->toPublicArray();

        return Inertia::render('welcome', [
            'intake' => fn () => $intake->banner(),
            'announcements' => fn () => Announcement::forPublicDisplay()
                ->limit(3)
                ->get()
                ->map->toPublicArray(),
        ]);
    }
}