<?php

use App\Http\Controllers\Violations\ViolationController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->prefix('violations')->name('violations.')->group(function () {
    Route::get('/', [ViolationController::class, 'index'])->name('index');
    Route::get('create', [ViolationController::class, 'create'])->name('create');
    Route::post('/', [ViolationController::class, 'store'])->name('store');
    Route::get('{violation}/edit', [ViolationController::class, 'edit'])->name('edit');
    Route::patch('{violation}', [ViolationController::class, 'update'])->name('update');
    Route::delete('{violation}', [ViolationController::class, 'destroy'])->name('destroy');
});