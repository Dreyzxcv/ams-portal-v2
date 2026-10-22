<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\WelcomeController;
use Illuminate\Support\Facades\Route;

Route::get('/', WelcomeController::class)->name('home');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');
});

require __DIR__.'/announcements.php';
require __DIR__.'/intake.php';
require __DIR__.'/settings.php';
require __DIR__.'/users.php';
require __DIR__.'/batches.php';
require __DIR__.'/grades.php';
require __DIR__.'/quizzes.php';
require __DIR__.'/violations.php';
require __DIR__.'/progress.php';
require __DIR__.'/certificates.php';
require __DIR__.'/otp.php';
