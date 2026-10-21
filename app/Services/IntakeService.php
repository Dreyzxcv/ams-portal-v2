<?php

namespace App\Services;

use App\Enums\IntakeStatus;
use App\Models\IntakeSetting;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class IntakeService
{
    public function __construct(private readonly AuditLogger $audit) {}

    public function update(User $actor, IntakeStatus $status): void
    {
        DB::transaction(function () use ($actor, $status) {
            $setting = IntakeSetting::query()->lockForUpdate()->find(IntakeSetting::SINGLETON_ID)
                ?? (new IntakeSetting)->forceFill(['id' => IntakeSetting::SINGLETON_ID]);

            $from = $setting->status?->value;

            $setting->fill(['status' => $status, 'updated_by' => $actor->id]);

            if ($setting->exists && ! $setting->isDirty('status')) {
                return;
            }

            $setting->save();

            $this->audit->record('intake.updated', $actor, 'intake_setting', IntakeSetting::SINGLETON_ID, [
                'from' => $from,
                'to' => $status->value,
            ]);
        });
    }

    /**
     * What the public welcome page shows, or null when intake was never saved.
     *
     * @return array{status: string, message: string}|null
     */
    public function banner(): ?array
    {
        $setting = IntakeSetting::current();

        if (! $setting->exists) {
            return null;
        }

        return [
            'status' => $setting->status->value,
            'message' => (string) config('ams.intake.messages.'.$setting->status->value),
        ];
    }
}