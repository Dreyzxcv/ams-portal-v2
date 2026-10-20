<?php

namespace App\Services;

use App\Enums\IntakeStatus;
use App\Models\Batch;
use App\Models\IntakeSetting;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class IntakeService
{
    public function __construct(private readonly AuditLogger $audit) {}

    public function update(User $actor, int $batchId, IntakeStatus $status): void
    {
        DB::transaction(function () use ($actor, $batchId, $status) {
            $setting = IntakeSetting::query()->lockForUpdate()->find(IntakeSetting::SINGLETON_ID)
                ?? (new IntakeSetting)->forceFill(['id' => IntakeSetting::SINGLETON_ID]);

            $from = ['batch_id' => $setting->current_batch_id, 'status' => $setting->status?->value];

            $setting->fill([
                'current_batch_id' => $batchId,
                'status' => $status,
                'updated_by' => $actor->id,
            ]);

            if ($setting->exists && ! $setting->isDirty(['current_batch_id', 'status'])) {
                return;
            }

            $setting->save();

            $this->audit->record('intake.updated', $actor, 'intake_setting', IntakeSetting::SINGLETON_ID, [
                'from' => $from,
                'to' => ['batch_id' => $batchId, 'status' => $status->value],
            ]);
        });
    }

    /**
     * What the public welcome page shows, or null when intake is not configured
     * (or the chosen batch no longer exists).
     *
     * @return array{status: string, batch: string, message: string}|null
     */
    public function banner(): ?array
    {
        $setting = IntakeSetting::current();

        if ($setting->current_batch_id === null) {
            return null;
        }

        $batch = Batch::find($setting->current_batch_id); // soft-deleted batches are excluded

        if ($batch === null) {
            return null;
        }

        $label = $batch->numberLabel();
        $template = (string) config('ams.intake.messages.'.$setting->status->value);

        return [
            'status' => $setting->status->value,
            'batch' => $label,
            'message' => str_replace(':batch', $label, $template),
        ];
    }
}