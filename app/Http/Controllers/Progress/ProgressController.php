<?php

namespace App\Http\Controllers\Progress;

use App\Enums\Role;
use App\Enums\UserStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Progress\UpdateProgressRequest;
use App\Models\TraineeProgress;
use App\Models\User;
use App\Models\GradeComponent;
use App\Support\CurrentPhase;
use App\Services\ProgressService;
use App\Support\Permissions;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProgressController extends Controller
{
    public function __construct(private readonly ProgressService $progress) {}

    public function index(Request $request): Response|RedirectResponse
    {
        $actor = $request->user();

        // Trainees see their own progress on the dashboard.
        if (! Permissions::allows($actor, Permissions::PROGRESS_MANAGE)) {
            return to_route('dashboard');
        }

        $search = trim((string) $request->query('search', ''));

        $components = GradeComponent::query()->where('active', true)->orderBy('sequence')->get();

        $trainees = User::query()
            ->where('role', Role::Trainee->value)
            ->where('status', UserStatus::Active->value)
            ->with(['progress.updater:id,name', 'gradeRecords', 'activeBatchAssignment.batch:id,starts_on,ends_on'])
            ->when($search !== '', function ($query) use ($search) {
                $term = '%'.addcslashes(mb_strtolower($search), '%_\\').'%';
                $query->where(function ($q) use ($term) {
                    $q->whereRaw('lower(name) like ?', [$term])
                        ->orWhereRaw('lower(username) like ?', [$term]);
                });
            })
            ->orderBy('name')
            ->orderBy('id')
            ->paginate(20)
            ->withQueryString()
            ->through(fn (User $t) => [
                'id' => $t->id,
                'name' => $t->name,
                'username' => $t->username,
                'current_phase' => CurrentPhase::resolve($components, $t->gradeRecords->keyBy('component_id'))['title'] ?? null,
                'started_on' => $t->activeBatchAssignment?->batch?->starts_on?->toDateString()
                    ?? $t->progress?->started_on?->toDateString(),
                'remaining_days' => $t->activeBatchAssignment?->batch?->daysLeft(),
                'batch_ended' => $t->activeBatchAssignment?->batch?->hasEnded() ?? false,
                'updated_at' => $t->progress?->updated_at?->toIso8601String(),
                'updated_by' => $t->progress?->updater?->name,
            ]);

        return Inertia::render('progress/index', [
            'trainees' => $trainees,
            'filters' => ['search' => $search],
            'max_phase' => (int) config('ams.progress.max_phase'),
        ]);
    }

    public function edit(Request $request, User $trainee): Response
    {
        abort_unless(Permissions::allows($request->user(), Permissions::PROGRESS_MANAGE), 403);
        abort_unless($trainee->role === Role::Trainee, 404);

        $progress = TraineeProgress::with('updater:id,name')->find($trainee->id);
        $batch = $trainee->activeBatchAssignment()->with('batch:id,starts_on,ends_on')->first()?->batch;

        return Inertia::render('progress/edit', [
            'trainee' => ['id' => $trainee->id, 'name' => $trainee->name, 'username' => $trainee->username],
            'progress' => [
                'current_phase' => $progress?->current_phase ?? 1,
                'started_on' => $progress?->started_on?->toDateString(),
                'exists' => $progress !== null,
                'updated_at' => $progress?->updated_at?->toIso8601String(),
                'updated_by' => $progress?->updater?->name,
            ],
            'batch_starts_on' => $batch?->starts_on?->toDateString(),
            'batch_ends_on' => $batch?->ends_on?->toDateString(),
            'remaining_days' => $batch?->daysLeft(),
            'batch_ended' => $batch?->hasEnded() ?? false,
            'max_phase' => (int) config('ams.progress.max_phase'),
        ]);
    }

    public function update(UpdateProgressRequest $request, User $trainee): RedirectResponse
    {
        abort_unless($trainee->role === Role::Trainee, 404);

        $this->progress->save($request->user(), $trainee, $request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Progress updated.')]);

        return to_route('progress.index');
    }
}
