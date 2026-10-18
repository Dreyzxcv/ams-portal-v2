<?php

namespace App\Http\Controllers\Violations;

use App\Enums\Role;
use App\Http\Controllers\Controller;
use App\Http\Requests\Violations\StoreViolationRequest;
use App\Http\Requests\Violations\UpdateViolationRequest;
use App\Models\User;
use App\Models\Violation;
use App\Services\ViolationService;
use App\Support\Permissions;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class ViolationController extends Controller
{
    public function __construct(private readonly ViolationService $violations) {}

    public function index(Request $request): Response|RedirectResponse
    {
        $actor = $request->user();

        // Trainees see only their own list.
        $isManager = Permissions::allows($actor, Permissions::VIOLATIONS_MANAGE);

        abort_unless($isManager || ($actor->isActive() && $actor->role === Role::Trainee), 403);

        $search = trim((string) $request->query('search', ''));

        $rows = Violation::query()
            ->with(['trainee:id,name,username', 'issuer:id,name'])
            ->when(! $isManager, fn ($q) => $q->where('trainee_id', $actor->id))
            ->when($isManager && $search !== '', function ($q) use ($search) {
                $term = '%'.addcslashes(mb_strtolower($search), '%_\\').'%';
                $q->whereHas('trainee', fn ($t) => $t
                    ->whereRaw('lower(name) like ?', [$term])
                    ->orWhereRaw('lower(username) like ?', [$term]));
            })
            ->orderByDesc('occurred_on')
            ->orderByDesc('id')
            ->paginate(20)
            ->withQueryString()
            ->through(fn (Violation $v) => [
                'id' => $v->id,
                'trainee_name' => $v->trainee?->name,
                'trainee_username' => $v->trainee?->username,
                'issued_by' => $v->issuer?->name ?? $v->issued_by_name,
                'occurred_on' => $v->occurred_on?->toDateString(),
                'description' => $v->description,
                'can_edit' => $actor->can('update', $v),
            ]);

        return Inertia::render('violations/index', [
            'violations' => $rows,
            'filters' => ['search' => $search],
            'can' => ['create' => $actor->can('create', Violation::class)],
        ]);
    }

    public function create(): Response
    {
        Gate::authorize('create', Violation::class);

        $trainees = User::query()
            ->where('role', Role::Trainee->value)
            ->where('status', 'active')
            ->orderBy('name')
            ->limit(500)
            ->get(['id', 'name', 'username']);

        return Inertia::render('violations/create', ['trainees' => $trainees]);
    }

    public function store(StoreViolationRequest $request): RedirectResponse
    {
        $this->violations->create($request->user(), $request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Violation recorded.')]);

        return to_route('violations.index');
    }

    public function edit(Violation $violation): Response
    {
        Gate::authorize('update', $violation);

        $violation->load('trainee:id,name,username');

        return Inertia::render('violations/edit', [
            'violation' => [
                'id' => $violation->id,
                'trainee_name' => $violation->trainee?->name,
                'occurred_on' => $violation->occurred_on?->toDateString(),
                'description' => $violation->description,
            ],
        ]);
    }

    public function update(UpdateViolationRequest $request, Violation $violation): RedirectResponse
    {
        $this->violations->update($request->user(), $violation, $request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Violation updated.')]);

        return to_route('violations.index');
    }

    public function destroy(Request $request, Violation $violation): RedirectResponse
    {
        Gate::authorize('delete', $violation);

        $this->violations->delete($request->user(), $violation);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Violation deleted.')]);

        return to_route('violations.index');
    }
}