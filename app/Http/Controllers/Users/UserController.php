<?php

namespace App\Http\Controllers\Users;

use App\Enums\Role;
use App\Enums\UserStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Users\StoreUserRequest;
use App\Http\Requests\Users\UpdateUserRequest;
use App\Http\Requests\Users\UpdateUserStatusRequest;
use App\Models\User;
use App\Services\UserService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function __construct(private readonly UserService $users) {}

    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', User::class);

        $search = trim((string) $request->query('search', ''));
        $role = Role::tryFrom((string) $request->query('role', ''));
        $status = UserStatus::tryFrom((string) $request->query('status', ''));

        $users = User::query()
            ->when($search !== '', function ($query) use ($search) {
                $term = '%'.addcslashes(mb_strtolower($search), '%_\\').'%';

                $query->where(function ($query) use ($term) {
                    $query->whereRaw('lower(name) like ?', [$term])
                        ->orWhereRaw('lower(username) like ?', [$term])
                        ->orWhereRaw('lower(email) like ?', [$term]);
                });
            })
            ->when($role, fn ($query) => $query->where('role', $role->value))
            ->when($status, fn ($query) => $query->where('status', $status->value))
            ->orderBy('name')
            ->orderBy('id')
            ->paginate(20)
            ->withQueryString()
            ->through(fn (User $user) => $this->present($user));

        return Inertia::render('users/index', [
            'users' => $users,
            'filters' => [
                'search' => $search,
                'role' => $role?->value,
                'status' => $status?->value,
            ],
            'roles' => $this->roleOptions(),
            'statuses' => array_map(fn (UserStatus $s) => $s->value, UserStatus::cases()),
        ]);
    }

    public function create(): Response
    {
        Gate::authorize('create', User::class);

        return Inertia::render('users/create', ['roles' => $this->roleOptions()]);
    }

    public function store(StoreUserRequest $request): RedirectResponse
    {
        [$user, $temporaryPassword] = $this->users->create($request->user(), $request->validated());

        // Shown once, on the next page only.
        Inertia::flash('credentials', [
            'username' => $user->username,
            'password' => $temporaryPassword,
        ]);

        return to_route('users.index');
    }

    public function edit(Request $request, User $user): Response
    {
        Gate::authorize('update', $user);

        $actor = $request->user();

        return Inertia::render('users/edit', [
            'user' => $this->present($user),
            'roles' => $this->roleOptions(),
            'statuses' => array_map(fn (UserStatus $s) => $s->value, UserStatus::cases()),
            'can' => [
                'changeRole' => $actor->can('changeRole', $user),
                'changeStatus' => $actor->can('changeStatus', $user),
                'resetPassword' => $actor->can('resetPassword', $user),
            ],
        ]);
    }

    public function update(UpdateUserRequest $request, User $user): RedirectResponse
    {
        $data = $request->validated();

        if (isset($data['role']) && Role::from($data['role']) !== $user->role) {
            Gate::authorize('changeRole', $user);
        }

        $this->users->update($request->user(), $user, $data);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('User updated.')]);

        return to_route('users.edit', $user);
    }

    public function updateStatus(UpdateUserStatusRequest $request, User $user): RedirectResponse
    {
        $this->users->changeStatus($request->user(), $user, UserStatus::from($request->validated('status')));

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Status updated.')]);

        return to_route('users.edit', $user);
    }

    public function resetPassword(Request $request, User $user): RedirectResponse
    {
        Gate::authorize('resetPassword', $user);

        $temporaryPassword = $this->users->resetPassword($request->user(), $user);

        Inertia::flash('credentials', [
            'username' => $user->username,
            'password' => $temporaryPassword,
        ]);

        return to_route('users.edit', $user);
    }

    /** @return array<string, mixed> */
    private function present(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'username' => $user->username,
            'email' => $user->email,
            'role' => $user->role?->value,
            'role_label' => $user->role?->label(),
            'status' => $user->status?->value,
            'force_password_change' => $user->force_password_change,
            'last_login_at' => $user->last_login_at?->toIso8601String(),
        ];
    }

    /** @return list<array{value: string, label: string}> */
    private function roleOptions(): array
    {
        return array_map(
            fn (Role $role) => ['value' => $role->value, 'label' => $role->label()],
            Role::cases(),
        );
    }
}
