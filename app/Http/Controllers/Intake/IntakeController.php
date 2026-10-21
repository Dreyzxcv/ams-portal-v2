<?php

namespace App\Http\Controllers\Intake;

use App\Enums\IntakeStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Intake\UpdateIntakeRequest;
use App\Models\IntakeSetting;
use App\Services\IntakeService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Gate;

class IntakeController extends Controller
{
    public function __construct(private readonly IntakeService $intake) {}

    public function edit(): Response
    {
        Gate::authorize('view', IntakeSetting::class);

        $setting = IntakeSetting::current()->load('updater:id,name');

        return Inertia::render('intake/edit', [
            'setting' => [
                'status' => $setting->status->value,
                'updated_at' => $setting->updated_at?->toIso8601String(),
                'updated_by' => $setting->updater?->name,
            ],
            'statuses' => array_map(
                fn (IntakeStatus $s) => ['value' => $s->value, 'label' => $s->label()],
                IntakeStatus::cases(),
            ),
            'banner' => $this->intake->banner(),
        ]);
    }

    public function update(UpdateIntakeRequest $request): RedirectResponse
    {
        $this->intake->update(
            $request->user(),
            IntakeStatus::from($request->validated('status')),
        );

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Intake settings saved.')]);

        return to_route('intake.edit');
    }
}