<?php

namespace Database\Factories;

use App\Enums\Role;
use App\Models\QuizAccess;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<QuizAccess>
 */
class QuizAccessFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'quiz_id' => QuizFactory::new(),
            'trainee_id' => User::factory()->role(Role::Trainee),
            'granted_by' => User::factory()->headInstructor(),
            'granted_at' => now(),
            'revoked_at' => null,
        ];
    }
}
