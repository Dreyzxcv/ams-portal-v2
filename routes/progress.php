<?php

use App\Http\Controllers\Progress\ProgressController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->prefix('progress')->name('progress.')->group(function () {
    Route::get('/', [ProgressController::class, 'index'])->name('index');
    Route::get('{trainee}/edit', [ProgressController::class, 'edit'])->name('edit');
    Route::put('{trainee}', [ProgressController::class, 'update'])->name('update');
});