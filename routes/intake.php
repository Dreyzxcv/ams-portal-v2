<?php

use App\Http\Controllers\Intake\IntakeController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->prefix('intake')->name('intake.')->group(function () {
    Route::get('/', [IntakeController::class, 'edit'])->name('edit');
    Route::put('/', [IntakeController::class, 'update'])->name('update');
});