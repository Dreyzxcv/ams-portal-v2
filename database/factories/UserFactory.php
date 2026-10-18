<?php

namespace Database\Factories;

use App\Enums\Role;
use App\Enums\UserStatus;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'username' => strtolower(fake()->unique()->lexify('user_??????')),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'remember_token' => Str::random(10),
            'role' => Role::Trainee,
            'status' => UserStatus::Active,
        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }

    /**
     * Indicate that the model has two-factor authentication configured.
     */
    public function withTwoFactor(): static {}

    public function role(Role $role): static
    {
        return $this->state(fn (array $attributes) => ['role' => $role]);
    }

    public function admin(): static
    {
        return $this->role(Role::Admin);
    }

    public function headInstructor(): static
    {
        return $this->role(Role::HeadInstructor);
    }

    public function instructor(): static
    {
        return $this->role(Role::Instructor);
    }

    public function logisticOfficer(): static
    {
        return $this->role(Role::LogisticOfficer);
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => ['status' => UserStatus::Inactive]);
    }

    public function suspended(): static
    {
        return $this->state(fn (array $attributes) => ['status' => UserStatus::Suspended]);
    }
}
