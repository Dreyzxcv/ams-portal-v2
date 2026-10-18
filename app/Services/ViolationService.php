<?php

namespace App\Services;

use App\Enums\Role;
use App\Models\User;
use App\Models\Violation;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ViolationService
{
    public function __construct(private readonly AuditLogger $audit) {}

    /** @param array{trainee_id: int, occurred_on: string, description: string} $data */
    public function create(User $actor, array $data): Violation
    {
        return DB::transaction(function () use ($actor, $data) {
            $this->assertTrainee((int) $data['trainee_id']);

            $violation = Violation::create([
                'trainee_id' => $data['trainee_id'],
                'issued_by' => $actor->id,
                'occurred_on' => $data['occurred_on'],
                'description' => trim($data['description']),
            ]);

            $this->audit->record('violation.created', $actor, 'violation', $violation->id, [
                'trainee_id' => $violation->trainee_id,
            ]);

            return $violation;
        });
    }

    /** @param array{occurred_on: string, description: string} $data */
    public function update(User $actor, Violation $violation, array $data): void
    {
        DB::transaction(function () use ($actor, $violation, $data) {
            $violation->fill([
                'occurred_on' => $data['occurred_on'],
                'description' => trim($data['description']),
            ]);

            $changed = array_keys($violation->getDirty());

            if ($changed === []) {
                return;
            }

            $violation->save();

            $this->audit->record('violation.updated', $actor, 'violation', $violation->id, [
                'fields' => $changed,
            ]);
        });
    }

    public function delete(User $actor, Violation $violation): void
    {
        DB::transaction(function () use ($actor, $violation) {
            $violation->forceFill(['deleted_by' => $actor->id])->save();
            $violation->delete();

            $this->audit->record('violation.deleted', $actor, 'violation', $violation->id, [
                'trainee_id' => $violation->trainee_id,
            ]);
        });
    }

    private function assertTrainee(int $id): void
    {
        $ok = User::query()->whereKey($id)->where('role', Role::Trainee->value)->exists();

        if (! $ok) {
            throw ValidationException::withMessages(['trainee_id' => 'Choose a valid trainee.']);
        }
    }
}