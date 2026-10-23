<?php

namespace App\Support;

use App\Models\GradeComponent;
use App\Models\GradeRecord;
use Illuminate\Support\Collection;

final class CurrentPhase
{
    /**
     * First active component (by sequence) with no score yet.
     *
     * @param  Collection<int, GradeComponent>  $components
     * @param  Collection<int, GradeRecord>  $records  keyed by component_id
     * @return array{short: string, title: string}|null
     */
    public static function resolve(Collection $components, Collection $records): ?array
    {
        if ($components->isEmpty()) {
            return null;
        }

        $next = $components
            ->sortBy('sequence')
            ->first(fn (GradeComponent $c) => $records->get($c->id)?->score === null);

        if ($next === null) {
            return ['short' => 'Done', 'title' => 'Completed'];
        }

        if ($next->key === 'final_exam') {
            return ['short' => 'Final', 'title' => 'Final Examination'];
        }

        $short = str_replace('_', '.', (string) preg_replace('/^phase_/', '', $next->key));

        return ['short' => $short, 'title' => 'Phase '.$short];
    }
}