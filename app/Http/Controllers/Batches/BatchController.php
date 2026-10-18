<?php

namespace App\Http\Controllers\Batches;

use App\Enums\Role;
use App\Enums\UserStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Batches\AssignTraineeRequest;
use App\Http\Requests\Batches\StoreBatchRequest;
use App\Http\Requests\Batches\UpdateBatchRequest;
use App\Models\Batch;
use App\Models\BatchAssignment;
use App\Models\User;
use App\Services\BatchService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class BatchController extends Controller
{
    public function __construct(private readonly BatchService $batches) {}

    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', Batch::class);

        $search = trim((string) $request->query('search', ''));

        $batches = Batch::query()
            ->withCount('activeAssignments')
            ->when($search !== '', function ($query) use ($search) {
                $term = '%'.addcslashes(mb_strtolower($search), '%_\\').'%';
                $query->whereRaw('lower(name) like ?', [$term]);
            })
            ->orderByDesc('starts_on')
            ->orderBy('name')
            ->paginate(20)
            ->withQueryString()
            ->through(fn (Batch $batch) => [
                'id' => $batch->id,
                'name' => $batch->name,
                'starts_on' => $batch->starts_on?->toDateString(),
                'trainee_count' => $batch->active_assignments_count,
            ]);

        return Inertia::render('batches/index', [
            'batches' => $batches,
            'filters' => ['search' => $search],
            'can' => ['create' => $request->user()->can('create', Batch::class)],
        ]);
    }

    public function create(): Response
    {
        Gate::authorize('create', Batch::class);

        return Inertia::render('batches/create');
    }

    public function store(StoreBatchRequest $request): RedirectResponse
    {
        $batch = $this->batches->create($request->user(), $request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Batch created.')]);

        return to_route('batches.show', $batch);
    }

    public function show(Request $request, Batch $batch): Response
    {
        Gate::authorize('view', $batch);

        $actor = $request->user();
        $canAssign = $actor->can('assign', $batch);

        $members = $batch->activeAssignments()
            ->with('user:id,name,username')
            ->orderBy('assigned_at')
            ->get()
            ->map(fn (BatchAssignment $a) => [
                'id' => $a->id,
                'user_id' => $a->user_id,
                'name' => $a->user?->name,
                'username' => $a->user?->username,
                'assigned_at' => $a->assigned_at?->toIso8601String(),
            ])
            ->values();

        // Active trainees not currently in this batch (those in other batches are moved on assign).
        $available = $canAssign
            ? User::query()
                ->where('role', Role::Trainee->value)
                ->where('status', UserStatus::Active->value)
                ->whereDoesntHave('activeBatchAssignment', fn ($q) => $q->where('batch_id', $batch->id))
                ->with('activeBatchAssignment.batch:id,name')
                ->orderBy('name')
                ->limit(500)
                ->get()
                ->map(fn (User $u) => [
                    'id' => $u->id,
                    'name' => $u->name,
                    'username' => $u->username,
                    'current_batch' => $u->activeBatchAssignment?->batch?->name,
                ])
                ->values()
            : [];

        return Inertia::render('batches/show', [
            'batch' => [
                'id' => $batch->id,
                'name' => $batch->name,
                'starts_on' => $batch->starts_on?->toDateString(),
            ],
            'members' => $members,
            'available' => $available,
            'can' => [
                'update' => $actor->can('update', $batch),
                'delete' => $actor->can('delete', $batch),
                'assign' => $canAssign,
            ],
        ]);
    }

    public function update(UpdateBatchRequest $request, Batch $batch): RedirectResponse
    {
        $this->batches->update($request->user(), $batch, $request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Batch updated.')]);

        return to_route('batches.show', $batch);
    }

    public function destroy(Request $request, Batch $batch): RedirectResponse
    {
        Gate::authorize('delete', $batch);

        $this->batches->delete($request->user(), $batch);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Batch deleted.')]);

        return to_route('batches.index');
    }

    public function assign(AssignTraineeRequest $request, Batch $batch): RedirectResponse
    {
        $trainee = User::findOrFail($request->validated('user_id'));

        $this->batches->assign($request->user(), $batch, $trainee);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Trainee assigned.')]);

        return to_route('batches.show', $batch);
    }

    public function unassign(Request $request, Batch $batch, BatchAssignment $assignment): RedirectResponse
    {
        Gate::authorize('assign', $batch);

        $this->batches->unassign($request->user(), $batch, $assignment);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Trainee removed from batch.')]);

        return to_route('batches.show', $batch);
    }
}