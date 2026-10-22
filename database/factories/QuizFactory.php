<?php

namespace Database\Factories;

use App\Models\GradeComponent;
use App\Models\Quiz;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Quiz>
 */
class QuizFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'grade_component_key' => GradeComponent::query()->where('key', 'phase_1')->value('key') ?? 'phase_1',
            'title' => fake()->sentence(4),
            'instructions' => fake()->paragraph(),
            'duration_minutes' => 30,
        ];
    }

    public function finalExam(): static
    {
        return $this->state(fn (array $attributes) => ['grade_component_key' => 'final_exam']);
    }
}
