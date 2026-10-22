<?php

namespace App\Console\Commands\Quizzes;

use App\Services\QuizService;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('quizzes:submit-expired')]
#[Description('Automatically submit quiz attempts whose time limit has expired')]
class SubmitExpiredAttemptsCommand extends Command
{
    public function handle(QuizService $quizzes): int
    {
        $submitted = $quizzes->submitExpiredAttempts();
        $this->info("Submitted {$submitted} expired quiz attempt(s).");

        return self::SUCCESS;
    }
}
