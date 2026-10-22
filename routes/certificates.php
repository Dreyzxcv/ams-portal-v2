<?php

use App\Http\Controllers\Certificates\CertificateController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->prefix('certificates')->name('certificates.')->group(function () {
    Route::get('/', [CertificateController::class, 'index'])->name('index');

    Route::post('trainees/{trainee}', [CertificateController::class, 'store'])
        ->middleware('throttle:20,1')
        ->name('store');

    Route::post('{certificate}/revoke', [CertificateController::class, 'revoke'])->name('revoke');

    Route::get('{certificate}/download', [CertificateController::class, 'download'])
        ->middleware('throttle:30,1')
        ->name('download');

    Route::get('{certificate}/preview', [CertificateController::class, 'preview'])
        ->middleware('throttle:60,1')
        ->name('preview');
});