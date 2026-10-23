<?php

namespace App\Http\Controllers\Quizzes;

use App\Enums\Role;
use App\Enums\UserStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Quizzes\GrantQuizAccessRequest;
use App\Http\Requests\Quizzes\StoreQuizRequest;
use App\Http\Requests\Quizzes\UpdateQuizRequest;
use App\Models\AuditLog;
use App\Models\GradeComponent;
use App\Models\Quiz;
use App\Models\QuizAccess;
use App\Models\QuizAttempt;
use App\Models\User;
use App\Services\QuizService;
use App\Support\Permissions;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class QuizController extends Controller
{
    public function __construct(private readonly QuizService $quizzes) {}

    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', Quiz::class);

        $actor = $request->user();

        if ($actor->role === Role::Trainee) {
            $accesses = QuizAccess::query()
                ->where('trainee_id', $actor->id)
                ->whereNull('revoked_at')
                ->with([
                    'quiz.gradeComponent',
                    'quiz.attempts' => fn ($query) => $query->where('trainee_id', $actor->id),
                ])
                ->latest('granted_at')
                ->get();

            return Inertia::render('quizzes/trainee-index', [
                'quizzes' => $accesses->map(fn (QuizAccess $access) => [
                    'id' => $access->quiz->id,
                    'title' => $access->quiz->title,
                    'phase' => $access->quiz->gradeComponent->label,
                    'duration_minutes' => $access->quiz->duration_minutes,
                    'status' => $this->traineeStatus($access->quiz->attempts->first()),
                ])->values(),
            ]);
        }

        return Inertia::render('quizzes/index', [
            'quizzes' => Quiz::query()
                ->with('gradeComponent')
                ->withCount(['questions', 'attempts'])
                ->orderBy('grade_component_key')
                ->get()
                ->map(fn (Quiz $quiz) => [
                    'id' => $quiz->id,
                    'title' => $quiz->title,
                    'phase' => $quiz->gradeComponent->label,
                    'question_count' => $quiz->questions_count,
                    'attempt_count' => $quiz->attempts_count,
                ])->values(),
            'can' => ['create' => Permissions::allows($actor, Permissions::QUIZZES_MANAGE)
                && GradeComponent::query()
                    ->whereIn('key', ['phase_1', 'final_exam'])
                    ->where('active', true)
                    ->whereDoesntHave('quiz')
                    ->exists()],
        ]);
    }

    public function create(): Response
    {
        Gate::authorize('manage', Quiz::class);

        return Inertia::render('quizzes/form', [
            'quiz' => null,
            'attempts_started' => false,
            'components' => $this->availableComponents(),
        ]);
    }

    public function store(StoreQuizRequest $request): RedirectResponse
    {
        $quiz = $this->quizzes->create($request->user(), $request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Quiz created.')]);

        return to_route('quizzes.show', $quiz);
    }

    public function show(Request $request, Quiz $quiz): Response
    {
        Gate::authorize('manage', $quiz);

        $quiz->load('gradeComponent');
        $accesses = $quiz->accesses()
            ->whereNull('revoked_at')
            ->with('trainee:id,name,username')
            ->orderBy('granted_at')
            ->get();
        $attempts = $quiz->attempts()
            ->with('trainee:id,name,username')
            ->orderByDesc('started_at')
            ->get();
        $activityEvents = AuditLog::query()
            ->where('subject_type', 'quiz_attempt')
            ->whereIn('subject_id', $attempts->pluck('id')->map(fn ($id) => (string) $id))
            ->whereIn('action', array_map(
                fn (string $event) => 'quiz.'.$event,
                ['page_hidden', 'page_visible', 'window_blur', 'window_focus', 'fullscreen_entered', 'fullscreen_exited', 'fullscreen_unsupported'],
            ))
            ->orderBy('occurred_at')
            ->orderBy('id')
            ->get(['action', 'subject_id', 'occurred_at'])
            ->groupBy('subject_id');

        $availableTrainees = User::query()
            ->where('role', Role::Trainee->value)
            ->where('status', UserStatus::Active->value)
            ->whereDoesntHave('quizAccesses', fn ($query) => $query
                ->where('quiz_id', $quiz->id)
                ->whereNull('revoked_at'))
            ->orderBy('name')
            ->limit(500)
            ->get(['id', 'name', 'username']);

        return Inertia::render('quizzes/show', [
            'quiz' => [
                'id' => $quiz->id,
                'title' => $quiz->title,
                'phase' => $quiz->gradeComponent->label,
                'grade_component_key' => $quiz->grade_component_key,
                'duration_minutes' => $quiz->duration_minutes,
                'instructions' => $quiz->instructions,
                'question_count' => $quiz->questions()->count(),
                'total_points' => $quiz->questions()->sum('points'),
            ],
            'accesses' => $accesses->map(fn (QuizAccess $access) => [
                'trainee_id' => $access->trainee_id,
                'name' => $access->trainee->name,
                'username' => $access->trainee->username,
                'granted_at' => $access->granted_at->toIso8601String(),
            ])->values(),
            'available_trainees' => $availableTrainees,
            'attempts' => $attempts->map(fn (QuizAttempt $attempt) => [
                'id' => $attempt->id,
                'trainee_id' => $attempt->trainee_id,
                'name' => $attempt->trainee->name,
                'username' => $attempt->trainee->username,
                'started_at' => $attempt->started_at->toIso8601String(),
                'submitted_at' => $attempt->submitted_at?->toIso8601String(),
                'reviewed_at' => $attempt->reviewed_at?->toIso8601String(),
                'status' => $attempt->isReviewed() ? 'graded' : ($attempt->isSubmitted() ? 'awaiting review' : 'in progress'),
                'auto_score' => $attempt->auto_score,
                'final_score' => $attempt->final_score,
                'activity' => $this->activitySummary($activityEvents->get((string) $attempt->id, collect())),
            ])->values(),

            'can' => ['reset_attempts' => Permissions::allows($request->user(), Permissions::QUIZZES_RESET_ATTEMPTS)],
        ]);
    }

    public function edit(Quiz $quiz): Response
    {
        Gate::authorize('manage', $quiz);
        $attemptsStarted = $quiz->attempts()->exists();

        return Inertia::render('quizzes/form', [
            'quiz' => [
                'id' => $quiz->id,
                'title' => $quiz->title,
                'grade_component_key' => $quiz->grade_component_key,
                'instructions' => $quiz->instructions,
                'duration_minutes' => $quiz->duration_minutes,
                'questions' => $quiz->questions()->get()->map(fn ($question) => [
                    'id' => $question->id,
                    'type' => $question->type,
                    'prompt' => $question->prompt,
                    'points' => $question->points,
                    'options' => $question->options,
                    'correct_option' => $question->correct_option,
                ])->values(),
            ],
            'attempts_started' => $attemptsStarted,
            'components' => $this->availableComponents($quiz),
        ]);
    }

    public function update(UpdateQuizRequest $request, Quiz $quiz): RedirectResponse
    {
        $this->quizzes->update($request->user(), $quiz, $request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Quiz updated.')]);

        return to_route('quizzes.show', $quiz);
    }

    public function grant(GrantQuizAccessRequest $request, Quiz $quiz): RedirectResponse
    {
        $trainee = User::query()->whereKey((int) $request->validated('trainee_id'))->firstOrFail();
        $this->quizzes->grantAccess($request->user(), $quiz, $trainee);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Quiz access granted.')]);

        return to_route('quizzes.show', $quiz);
    }

    public function resetAttempt(Request $request, Quiz $quiz, QuizAttempt $attempt): RedirectResponse
    {
        Gate::authorize('resetAttempt', $quiz);
        abort_unless($attempt->quiz_id === $quiz->id, 404);

        $this->quizzes->resetAttempt($request->user(), $quiz, $attempt);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Quiz attempt reset. The trainee can retake the quiz.')]);

        return to_route('quizzes.show', $quiz);
    }

    public function revoke(Request $request, Quiz $quiz, User $trainee): RedirectResponse
    {
        Gate::authorize('manage', $quiz);
        abort_unless($trainee->role === Role::Trainee, 404);
        $this->quizzes->revokeAccess($request->user(), $quiz, $trainee);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Quiz access revoked.')]);

        return to_route('quizzes.show', $quiz);
    }

    /** @return Collection<int, array{key: string, label: string}> */
    private function availableComponents(?Quiz $quiz = null): Collection
    {
        return GradeComponent::query()
            ->whereIn('key', ['phase_1', 'final_exam'])
            ->where('active', true)
            ->where(function ($query) use ($quiz): void {
                $query->whereDoesntHave('quiz');

                if ($quiz !== null) {
                    $query->orWhere('key', $quiz->grade_component_key);
                }
            })
            ->orderBy('sequence')
            ->get(['key', 'label'])
            ->map(fn (GradeComponent $component) => [
                'key' => $component->key,
                'label' => $component->label,
            ])
            ->values();
    }

    private function traineeStatus(?QuizAttempt $attempt): string
    {
        if ($attempt === null) {
            return 'available';
        }

        if ($attempt->isReviewed()) {
            return 'graded';
        }

        return $attempt->isSubmitted() ? 'awaiting review' : 'in progress';
    }

    /**
     * Page inactivity is a signal, not proof of misconduct. Notifications,
     * screen locks and clicking outside the page can trigger it too.
     *
     * @param  Collection<int, AuditLog>  $events
     * @return array<string, mixed>
     */
    private function activitySummary(Collection $events): array
    {
        $leftCount = 0;
        $awaySeconds = 0;
        $fullscreenExits = 0;
        $unsupported = false;
        $awayStart = null;

        foreach ($events as $event) {
            $name = substr($event->action, 5);
            $at = $event->occurred_at?->getTimestamp();

            if ($at === null) {
                continue;
            }

            if (in_array($name, ['page_hidden', 'window_blur'], true) && $awayStart === null) {
                $leftCount++;
                $awayStart = $at;
            } elseif (in_array($name, ['page_visible', 'window_focus'], true) && $awayStart !== null) {
                $awaySeconds += max(0, $at - $awayStart);
                $awayStart = null;
            } elseif ($name === 'fullscreen_exited') {
                $fullscreenExits++;
            } elseif ($name === 'fullscreen_unsupported') {
                $unsupported = true;
            }
        }

        return [
            'left_count' => $leftCount,
            'away_seconds' => $awaySeconds,
            'fullscreen_exits' => $fullscreenExits,
            'fullscreen_unsupported' => $unsupported,
            'events' => $events->take(-200)->map(fn (AuditLog $event) => [
                'action' => substr($event->action, 5),
                'at' => $event->occurred_at?->toIso8601String(),
            ])->values(),
        ];
    }
}
