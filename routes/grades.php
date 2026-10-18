<?php

use App\Http\Controllers\Grades\GradeController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->prefix('grades')->name('grades.')->group(function () {
    Route::get('/', [GradeController::class, 'index'])->name('index');
    Route::get('{trainee}', [GradeController::class, 'show'])->name('show');
    Route::put('{trainee}/components/{component}', [GradeController::class, 'update'])->name('update');
});