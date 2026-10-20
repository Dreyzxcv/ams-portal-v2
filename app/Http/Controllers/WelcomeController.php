<?php

namespace App\Http\Controllers;

use App\Services\IntakeService;
use Inertia\Inertia;
use Inertia\Response;

class WelcomeController extends Controller
{
    public function __invoke(IntakeService $intake): Response
    {
        return Inertia::render('welcome', ['intake' => $intake->banner()]);
    }
}