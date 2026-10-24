<?php

use App\Http\Controllers\ChainOfCommand\ChainOfCommandController;
use Illuminate\Support\Facades\Route;

Route::get('chain-of-command', [ChainOfCommandController::class, 'index'])->name('chain.index');

Route::middleware(['auth'])->prefix('chain-of-command/manage')->name('chain.')->group(function () {
    Route::get('/', [ChainOfCommandController::class, 'manage'])->name('manage');
    Route::post('/', [ChainOfCommandController::class, 'store'])->middleware('throttle:30,1')->name('store');
    Route::patch('{entry}', [ChainOfCommandController::class, 'update'])->middleware('throttle:30,1')->name('update');
    Route::delete('{entry}', [ChainOfCommandController::class, 'destroy'])->name('destroy');
});