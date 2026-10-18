<?php

use App\Http\Controllers\Batches\BatchController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->prefix('batches')->name('batches.')->group(function () {
    Route::get('/', [BatchController::class, 'index'])->name('index');
    Route::get('create', [BatchController::class, 'create'])->name('create');
    Route::post('/', [BatchController::class, 'store'])->name('store');
    Route::get('{batch}', [BatchController::class, 'show'])->name('show');
    Route::patch('{batch}', [BatchController::class, 'update'])->name('update');
    Route::delete('{batch}', [BatchController::class, 'destroy'])->name('destroy');

    Route::post('{batch}/assignments', [BatchController::class, 'assign'])->name('assign');
    Route::delete('{batch}/assignments/{assignment}', [BatchController::class, 'unassign'])
        ->scopeBindings()
        ->name('unassign');
});