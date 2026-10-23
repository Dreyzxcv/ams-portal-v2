<?php

use App\Http\Controllers\Quizzes\QuizAttemptController;
use App\Http\Controllers\Quizzes\QuizController;
use App\Http\Controllers\Quizzes\QuizReviewController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->prefix('quizzes')->name('quizzes.')->group(function () {
    Route::get('/', [QuizController::class, 'index'])->name('index');
    Route::get('create', [QuizController::class, 'create'])->name('create');
    Route::post('/', [QuizController::class, 'store'])->name('store');
    Route::get('{quiz}/edit', [QuizController::class, 'edit'])->name('edit');
    Route::put('{quiz}', [QuizController::class, 'update'])->name('update');
    Route::post('{quiz}/access', [QuizController::class, 'grant'])->name('access.grant');
    Route::delete('{quiz}/access/{trainee}', [QuizController::class, 'revoke'])->name('access.revoke');

    Route::get('{quiz}/take', [QuizAttemptController::class, 'take'])->name('take');
    Route::post('{quiz}/attempts', [QuizAttemptController::class, 'start'])->name('attempts.start');
    Route::get('attempts/{attempt}', [QuizAttemptController::class, 'show'])->name('attempts.show');
    Route::patch('attempts/{attempt}/answers', [QuizAttemptController::class, 'saveAnswers'])
        ->name('attempts.answers');
    Route::post('attempts/{attempt}/submit', [QuizAttemptController::class, 'submit'])
        ->name('attempts.submit');

    Route::get('{quiz}/attempts/{attempt}/review', [QuizReviewController::class, 'show'])
        ->scopeBindings()
        ->name('attempts.review');
    Route::put('{quiz}/attempts/{attempt}/review', [QuizReviewController::class, 'update'])
        ->scopeBindings()
        ->name('attempts.review.update');
    Route::delete('{quiz}/attempts/{attempt}', [QuizController::class, 'resetAttempt'])
        ->scopeBindings()
        ->name('attempts.reset');
    Route::get('{quiz}', [QuizController::class, 'show'])->name('show');
});
