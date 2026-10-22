<?php

namespace Database\Factories;

use App\Models\QuizQuestion;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<QuizQuestion>
 */
class QuizQuestionFactory extends Factory
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
            'type' => 'multiple_choice',
            'prompt' => fake()->sentence(),
            'points' => 1,
            'options' => ['First answer', 'Second answer'],
            'correct_option' => 0,
            'position' => 1,
        ];
    }

    public function paragraph(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'paragraph',
            'options' => null,
            'correct_option' => null,
        ]);
    }
}
