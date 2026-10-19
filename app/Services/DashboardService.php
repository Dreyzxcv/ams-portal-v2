<?php

namespace App\Services;

use App\Enums\CertificateStatus;
use App\Enums\Role;
use App\Enums\UserStatus;
use App\Models\AuditLog;
use App\Models\Batch;
use App\Models\BatchAssignment;
use App\Models\Certificate;
use App\Models\GradeComponent;
use App\Models\GradeRecord;
use App\Models\TraineeProgress;
use App\Models\User;
use App\Models\Violation;
use App\Support\Permissions;
use App\Support\ProgramSchedule;
use Illuminate\Support\Carbon;

class DashboardService
{
    /** @return array<string, mixed> */
    public function for(User $user): array
    {
        return $user->role === Role::Trainee
            ? $this->trainee($user)
            : $this->staff($user);
    }

    /** @return array<string, mixed> */
    private function staff(User $user): array
    {
        $groups = [];

        if (Permissions::allows($user, Permissions::USERS_MANAGE)) {
            $groups[] = [
                'title' => 'Users',
                'stats' => [
                    ['label' => 'Total users', 'value' => User::count(), 'href' => route('users.index')],
                    ['label' => 'Active users', 'value' => User::where('status', UserStatus::Active->value)->count(), 'href' => route('users.index', ['status' => 'active'])],
                    ['label' => 'Trainees', 'value' => User::where('role', Role::Trainee->value)->count(), 'href' => route('users.index', ['role' => 'trainee'])],
                ],
            ];
        }

        if (Permissions::allows($user, Permissions::BATCHES_VIEW)) {
            $inBatch = BatchAssignment::whereNull('unassigned_at')->count();

            $unassigned = User::query()
                ->where('role', Role::Trainee->value)
                ->where('status', UserStatus::Active->value)
                ->whereDoesntHave('activeBatchAssignment')
                ->count();

            $groups[] = [
                'title' => 'Batches',
                'stats' => [
                    ['label' => 'Batches', 'value' => Batch::count(), 'href' => route('batches.index')],
                    ['label' => 'Trainees in a batch', 'value' => $inBatch, 'href' => null],
                    ['label' => 'Active trainees without a batch', 'value' => $unassigned, 'href' => null],
                ],
            ];
        }

        if (Permissions::allows($user, Permissions::GRADES_VIEW_ALL)) {
            $final = GradeComponent::where('is_final', true)->where('active', true)->first();

            $passedFinal = $final === null ? 0 : GradeRecord::query()
                ->where('component_id', $final->id)
                ->where('score', '>=', $final->pass_score)
                ->count();

            $groups[] = [
                'title' => 'Grades',
                'stats' => [
                    ['label' => 'Grades entered, last 7 days', 'value' => GradeRecord::where('graded_at', '>=', now()->subDays(7))->count(), 'href' => route('grades.index')],
                    ['label' => 'Trainees who passed the final exam', 'value' => $passedFinal, 'href' => null],
                ],
            ];
        }

        if (Permissions::allows($user, Permissions::VIOLATIONS_MANAGE)) {
            $groups[] = [
                'title' => 'Violations',
                'stats' => [
                    ['label' => 'Last 30 days', 'value' => Violation::where('occurred_on', '>=', now()->subDays(30)->toDateString())->count(), 'href' => route('violations.index')],
                    ['label' => 'All time', 'value' => Violation::count(), 'href' => route('violations.index')],
                ],
            ];
        }

        if (Permissions::allows($user, Permissions::PROGRESS_MANAGE)) {
            $noProgress = User::query()
                ->where('role', Role::Trainee->value)
                ->where('status', UserStatus::Active->value)
                ->whereDoesntHave('progress')
                ->count();

            $groups[] = [
                'title' => 'Progress',
                'stats' => [
                    ['label' => 'Active trainees with no phase set', 'value' => $noProgress, 'href' => route('progress.index')],
                ],
            ];
        }

        if (Permissions::allows($user, Permissions::CERTIFICATES_MANAGE)) {
            $count = fn (CertificateStatus $s) => Certificate::where('status', $s->value)->count();

            $groups[] = [
                'title' => 'Certificates',
                'stats' => [
                    ['label' => 'Pending', 'value' => $count(CertificateStatus::Pending), 'href' => null],
                    ['label' => 'Issued', 'value' => $count(CertificateStatus::Issued), 'href' => null],
                    ['label' => 'Revoked', 'value' => $count(CertificateStatus::Revoked), 'href' => null],
                ],
            ];
        }

        $activity = Permissions::allows($user, Permissions::LOGS_VIEW)
            ? AuditLog::query()
                ->orderByDesc('occurred_at')
                ->orderByDesc('id')
                ->limit(10)
                ->get(['id', 'occurred_at', 'actor_username', 'action', 'subject_type', 'subject_id'])
                ->map(fn (AuditLog $l) => [
                    'id' => $l->id,
                    'occurred_at' => $l->occurred_at?->toIso8601String(),
                    'actor' => $l->actor_username ?? 'system',
                    'action' => $l->action,
                    'subject' => $l->subject_type ? "{$l->subject_type} #{$l->subject_id}" : null,
                ])->values()
            : null;

        $batches = Permissions::allows($user, Permissions::BATCHES_VIEW)
            ? Batch::query()
                ->withCount('activeAssignments')
                ->orderByDesc('id')
                ->get()
                ->map(fn (Batch $b) => [
                    'id' => $b->id,
                    'name' => $b->name,
                    'members' => $b->active_assignments_count,
                ])->values()
            : null;

        return ['mode' => 'staff', 'batches' => $batches, 'groups' => $groups, 'activity' => $activity, 'trainee' => null, 'trend' => $this->trend($user)];
    }

    /** @return array<string, mixed> */
    private function trainee(User $user): array
    {
        $batch = $user->activeBatchAssignment()->with('batch:id,name,starts_on')->first()?->batch;
        $progress = TraineeProgress::find($user->id);

        $components = GradeComponent::where('active', true)->get();
        $records = GradeRecord::where('trainee_id', $user->id)->get()->keyBy('component_id');

        $entered = $components->filter(fn ($c) => $records->get($c->id)?->score !== null)->count();
        $passed = $components->filter(function ($c) use ($records) {
            $score = $records->get($c->id)?->score;

            return $score !== null && $c->isPassing($score);
        })->count();

        $certificate = Certificate::query()
            ->where('trainee_id', $user->id)
            ->where('status', CertificateStatus::Issued->value)
            ->first();

        return [
            'mode' => 'trainee',
            'groups' => [],
            'activity' => null,   
            'batches' => null,
            'trainee' => [
                'batch' => $batch?->name,
                'current_phase' => $progress?->current_phase,
                'started_on' => $progress?->started_on?->toDateString(),
                'components' => $components->sortBy('id')->map(function ($c) use ($records) {
                    $score = $records->get($c->id)?->score;

                    return [
                        'name' => $c->name ?? $c->label ?? $c->title ?? $c->code ?? "Component {$c->id}",
                        'score' => $score === null ? null : (float) $score,
                        'max' => $c->max_score !== null ? (float) $c->max_score : null,
                        'passed' => $score === null ? null : $c->isPassing($score),
                    ];
                })->values(),
                'grades_total' => $components->count(),
                'grades_entered' => $entered,
                'grades_passed' => $passed,
                'violations' => Violation::where('trainee_id', $user->id)->count(),
                'certificate_number' => $certificate?->certificate_number,
                'certificate_issued_at' => $certificate?->issued_at?->toDateString(),
                'remaining_days' => ProgramSchedule::remainingDays($progress?->started_on),
                'trend' => null,
            ],
        ];
    }

    /** @return array{weeks: list<string>, series: list<array{label: string, values: list<int>}>}|null */
    private function trend(User $user): ?array
    {
        $weeks = 8;
        $start = now()->startOfWeek()->subWeeks($weeks - 1);
        $labels = collect(range(0, $weeks - 1))
            ->map(fn ($i) => $start->copy()->addWeeks($i)->toDateString())
            ->all();

        $bucket = function ($dates) use ($labels) {
            $counts = array_fill_keys($labels, 0);
            foreach ($dates as $d) {
                if ($d === null) {
                    continue;
                }
                $key = Carbon::parse($d)->startOfWeek()->toDateString();
                if (isset($counts[$key])) {
                    $counts[$key]++;
                }
            }

            return array_values($counts);
        };

        $series = [];

        if (Permissions::allows($user, Permissions::GRADES_VIEW_ALL)) {
            $series[] = [
                'label' => 'Grades entered',
                'values' => $bucket(GradeRecord::where('graded_at', '>=', $start)->pluck('graded_at')),
            ];
        }

        if (Permissions::allows($user, Permissions::VIOLATIONS_MANAGE)) {
            $series[] = [
                'label' => 'Violations',
                'values' => $bucket(Violation::where('occurred_on', '>=', $start->toDateString())->pluck('occurred_on')),
            ];
        }

        return $series === [] ? null : ['weeks' => $labels, 'series' => $series];
    }
}