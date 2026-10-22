<?php

namespace Database\Factories;

use App\Enums\Role;
use App\Models\QuizAttempt;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<QuizAttempt>
 */
class QuizAttemptFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $startedAt = now()->subMinutes(5);

        return [
            'quiz_id' => QuizFactory::new(),
            'trainee_id' => User::factory()->role(Role::Trainee),
            'started_at' => $startedAt,
            'expires_at' => $startedAt->copy()->addMinutes(30),
            'submitted_at' => null,
            'auto_score' => null,
            'manual_score' => null,
            'final_score' => null,
            'reviewed_by' => null,
            'reviewed_at' => null,
        ];
    }

    public function submitted(): static
    {
        return $this->state(fn (array $attributes) => [
            'submitted_at' => now(),
            'auto_score' => 0,
        ]);
    }
}
