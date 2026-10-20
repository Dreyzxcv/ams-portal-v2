<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class AnnouncementFactory extends Factory
{
    public function definition(): array
    {
        return [
            'recipient' => 'All Trainees',
            'sender' => 'Office of the Dean of Medicine',
            'subject' => fake()->sentence(4),
            'body' => fake()->paragraph(),
            'signature' => 'COL Kasokeeee, Dean of Medicine',
            'created_by' => User::factory(),
        ];
    }

    public function published(): static
    {
        return $this->state(fn () => ['published_at' => now()]);
    }
}