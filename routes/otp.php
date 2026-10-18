<?php

use App\Http\Controllers\Auth\OtpChallengeController;
use Illuminate\Support\Facades\Route;

Route::middleware('guest')->group(function () {
    Route::get('login/otp', [OtpChallengeController::class, 'show'])->name('otp.show');

    Route::post('login/otp', [OtpChallengeController::class, 'verify'])
        ->middleware('throttle:10,1')
        ->name('otp.verify');

    Route::post('login/otp/resend', [OtpChallengeController::class, 'resend'])
        ->middleware('throttle:3,1')
        ->name('otp.resend');
});