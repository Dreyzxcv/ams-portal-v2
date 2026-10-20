<?php

use App\Http\Controllers\AnnouncementController;
use App\Http\Controllers\PublicAnnouncementController;
use App\Models\Announcement;
use Illuminate\Support\Facades\Route;

Route::get('announcements/archive', [PublicAnnouncementController::class, 'index'])
    ->name('announcements.archive');

Route::middleware(['auth', 'can:viewAny,'.Announcement::class])
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
            Route::post('{announcement}/pin', [AnnouncementController::class, 'pin'])->name('pin');
            Route::post('{announcement}/unpin', [AnnouncementController::class, 'unpin'])->name('unpin');
        });
    });