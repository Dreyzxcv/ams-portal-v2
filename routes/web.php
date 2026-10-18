<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DashboardController;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');
});

require __DIR__.'/settings.php';
require __DIR__.'/users.php';
require __DIR__.'/batches.php';
require __DIR__.'/grades.php';
require __DIR__.'/violations.php';
require __DIR__.'/progress.php';
require __DIR__.'/otp.php';
