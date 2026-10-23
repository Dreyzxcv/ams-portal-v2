<?php

namespace App\Http\Controllers\Grades;

use App\Enums\Role;
use App\Http\Controllers\Controller;
use App\Http\Requests\Grades\UpdateGradeRequest;
use App\Models\GradeComponent;
use App\Models\GradeRecord;
use App\Models\GradeRevision;
use App\Models\User;
use App\Services\GradeService;
use App\Support\Permissions;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class GradeController extends Controller
{
    public function __construct(private readonly GradeService $grades) {}

    public function index(Request $request): Response|RedirectResponse
    {
        $actor = $request->user();

        if (! $actor->can('viewAny', GradeRecord::class)) {
            return to_route('grades.show', $actor);
        }

        $search = trim((string) $request->query('search', ''));
        $components = GradeComponent::query()
            ->with(['quiz' => fn ($query) => $query->withSum('questions as total_points', 'points')])
            ->where('active', true)
            ->orderBy('sequence')
            ->get();

        $trainees = User::query()
            ->where('role', Role::Trainee->value)
            ->with('gradeRecords')
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
                'scores' => $t->gradeRecords->mapWithKeys(
                    fn (GradeRecord $r) => [$r->component_id => $r->score],
                ),
            ]);

        return Inertia::render('grades/index', [
            'trainees' => $trainees,
            'components' => $components->map(fn (GradeComponent $c) => [
                'id' => $c->id,
                'label' => $c->label,
                'max_score' => number_format($c->effectiveMaxScore(), 2, '.', ''),
                'pass_score' => number_format($c->effectivePassScore(), 2, '.', ''),
            ])->values(),
            'filters' => ['search' => $search],
        ]);
    }

    public function show(Request $request, User $trainee): Response
    {
        $actor = $request->user();

        abort_unless($trainee->role === Role::Trainee, 404);

        $isSelf = $actor->isActive() && $actor->id === $trainee->id;

        abort_unless($isSelf || Permissions::allows($actor, Permissions::GRADES_VIEW_ALL), 403);

        $records = GradeRecord::query()
            ->where('trainee_id', $trainee->id)
            ->with('grader:id,name')
            ->get()
            ->keyBy('component_id');

        $components = GradeComponent::query()
            ->with(['quiz' => fn ($query) => $query->withSum('questions as total_points', 'points')])
            ->where('active', true)
            ->orderBy('sequence')
            ->get();

        $rows = $components->map(function (GradeComponent $c) use ($records) {
            $record = $records->get($c->id);

            return [
                'component_id' => $c->id,
                'label' => $c->label,
                'max_score' => number_format($c->effectiveMaxScore(), 2, '.', ''),
                'pass_score' => number_format($c->effectivePassScore(), 2, '.', ''),
                'is_final' => $c->is_final,
                'score' => $record?->score,
                'passed' => $record?->score !== null ? $c->isPassing($record->score) : null,
                'graded_by' => $record?->grader?->name,
                'graded_at' => $record?->graded_at?->toIso8601String(),
            ];
        })->values();

        $revisions = GradeRevision::query()
            ->whereIn('grade_record_id', $records->pluck('id'))
            ->with(['changer:id,name', 'record.component:id,label'])
            ->orderByDesc('changed_at')
            ->orderByDesc('id')
            ->limit(50)
            ->get()
            ->map(fn (GradeRevision $r) => [
                'id' => $r->id,
                'component' => $r->record?->component?->label,
                'old_score' => $r->old_score,
                'new_score' => $r->new_score,
                'changed_by' => $r->changer?->name,
                'changed_at' => $r->changed_at?->toIso8601String(),
                'reason' => $r->reason,
            ])->values();

        return Inertia::render('grades/show', [
            'trainee' => ['id' => $trainee->id, 'name' => $trainee->name, 'username' => $trainee->username],
            'rows' => $rows,
            'revisions' => $revisions,
            'can' => [
                'manage' => ! $isSelf && Permissions::allows($actor, Permissions::GRADES_MANAGE),
                'viewAll' => Permissions::allows($actor, Permissions::GRADES_VIEW_ALL),
            ],
        ]);
    }

    public function update(UpdateGradeRequest $request, User $trainee, GradeComponent $component): RedirectResponse
    {
        $this->grades->save(
            $request->user(),
            $trainee,
            $component,
            $request->validated('score'),
            $request->validated('reason'),
        );

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Grade saved.')]);

        return to_route('grades.show', $trainee);
    }
}