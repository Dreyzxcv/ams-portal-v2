<?php
namespace App\Http\Controllers;

use App\Models\Announcement;
use Inertia\Inertia;
use Inertia\Response;

class PublicAnnouncementController extends Controller
{
    public function index(): Response
    {
        $announcements = Announcement::forPublicDisplay()
            ->paginate(10)
            ->withQueryString()
            ->through(fn (Announcement $a) => $a->toPublicArray());

        return Inertia::render('announcements/archive', [
            'announcements' => $announcements,
        ]);
    }
}