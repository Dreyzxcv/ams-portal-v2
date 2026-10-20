<?php

use App\Http\Controllers\Auth\EmailSetupController;
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

    Route::get('login/email', [EmailSetupController::class, 'show'])->name('email-setup.show');

    Route::post('login/email', [EmailSetupController::class, 'store'])
        ->middleware('throttle:5,1')
        ->name('email-setup.store');

    Route::post('login/email/change', [EmailSetupController::class, 'change'])
        ->middleware('throttle:10,1')
        ->name('email-setup.change');

    Route::post('login/email/verify', [EmailSetupController::class, 'verify'])
        ->middleware('throttle:10,1')
        ->name('email-setup.verify');

    Route::post('login/email/resend', [EmailSetupController::class, 'resend'])
        ->middleware('throttle:3,1')
        ->name('email-setup.resend');
});