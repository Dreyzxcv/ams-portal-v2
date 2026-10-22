<?php

namespace App\Models;

use App\Enums\Role;
use App\Enums\UserStatus;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $name
 * @property string|null $username
 * @property string|null $email
 * @property Carbon|null $email_verified_at
 * @property string $password
 * @property Role|null $role
 * @property UserStatus|null $status
 * @property bool $force_password_change
 * @property Carbon|null $last_login_at
 * @property string|null $legacy_id
 * @property string|null $two_factor_secret
 * @property string|null $two_factor_recovery_codes
 * @property Carbon|null $two_factor_confirmed_at
 * @property string|null $remember_token
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property Carbon|null $deleted_at
 */
#[Fillable(['name', 'username', 'email', 'password'])]
#[Hidden(['password', 'two_factor_secret', 'two_factor_recovery_codes', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, SoftDeletes;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'role' => Role::class,
            'status' => UserStatus::class,
            'force_password_change' => 'boolean',
            'last_login_at' => 'datetime',
        ];
    }

    /** Usernames are stored lowercase; the database also enforces case-insensitive uniqueness. */
    /** @return Attribute<string|null, string|null> */
    protected function username(): Attribute
    {
        return Attribute::make(
            set: fn (?string $value) => $value === null ? null : mb_strtolower(trim($value)),
        );
    }

    /** @return Attribute<string|null, string|null> */
    protected function email(): Attribute
    {
        return Attribute::make(
            set: fn (?string $value) => $value === null || trim($value) === '' ? null : mb_strtolower(trim($value)),
        );
    }

    public function hasRole(Role ...$roles): bool
    {
        return $this->role !== null && in_array($this->role, $roles, true);
    }

    public function isAdmin(): bool
    {
        return $this->hasRole(Role::Admin);
    }

    public function isStaff(): bool
    {
        return $this->role?->isStaff() ?? false;
    }

    public function isActive(): bool
    {
        return $this->status === UserStatus::Active;
    }

    /** @return HasOne<TraineeProfile, $this> */
    public function traineeProfile(): HasOne
    {
        return $this->hasOne(TraineeProfile::class);
    }

    /** @return HasMany<BatchAssignment, $this> */
    public function batchAssignments(): HasMany
    {
        return $this->hasMany(BatchAssignment::class);
    }

    /** @return HasOne<BatchAssignment, $this> */
    public function activeBatchAssignment(): HasOne
    {
        return $this->hasOne(BatchAssignment::class)->whereNull('unassigned_at');
    }

    /** @return HasMany<GradeRecord, $this> */
    public function gradeRecords(): HasMany
    {
        return $this->hasMany(GradeRecord::class, 'trainee_id');
    }

    /** @return HasMany<QuizAccess, $this> */
    public function quizAccesses(): HasMany
    {
        return $this->hasMany(QuizAccess::class, 'trainee_id');
    }

    /** @return HasMany<QuizAttempt, $this> */
    public function quizAttempts(): HasMany
    {
        return $this->hasMany(QuizAttempt::class, 'trainee_id');
    }

    /** @return HasMany<Violation, $this> */
    public function violations(): HasMany
    {
        return $this->hasMany(Violation::class, 'trainee_id');
    }

    /** @return HasOne<Certificate, $this> */
    public function certificate(): HasOne
    {
        return $this->hasOne(Certificate::class, 'trainee_id');
    }

    /** @return HasOne<TraineeProgress, $this> */
    public function progress(): HasOne
    {
        return $this->hasOne(TraineeProgress::class, 'trainee_id');
    }

    /** @return HasMany<TrustedDevice, $this> */
    public function trustedDevices(): HasMany
    {
        return $this->hasMany(TrustedDevice::class);
    }
}
