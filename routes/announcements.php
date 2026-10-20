<?php

use App\Http\Controllers\AnnouncementController;
use App\Models\Announcement;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'can:viewAny,'.Announcement::class]) // plus any middleware your other route files use
    ->prefix('announcements')->name('announcements.')->group(function () {
        Route::get('/', [AnnouncementController::class, 'index'])->name('index');
        Route::get('create', [AnnouncementController::class, 'create'])->name('create');
        Route::post('/', [AnnouncementController::class, 'store'])->name('store');

        Route::whereNumber('announcement')->group(function () {
            Route::get('{announcement}/edit', [AnnouncementController::class, 'edit'])->name('edit');
            Route::put('{announcement}', [AnnouncementController::class, 'update'])->name('update');
            Route::delete('{announcement}', [AnnouncementController::class, 'destroy'])->name('destroy');
            Route::post('{announcement}/publish', [AnnouncementController::class, 'publish'])->name('publish');
            Route::post('{announcement}/unpublish', [AnnouncementController::class, 'unpublish'])->name('unpublish');
            Route::post('{announcement}/discord/retry', [AnnouncementController::class, 'retry'])->name('retry');
        });
    });