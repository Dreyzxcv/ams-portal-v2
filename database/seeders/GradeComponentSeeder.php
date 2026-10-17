<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class GradeComponentSeeder extends Seeder
{
    /**
     * Reference data, safe to run in every environment and to re-run (upserts on `key`).
     */
    public function run(): void
    {
        $now = now();

        $rows = [
            ['key' => 'phase_1',    'label' => 'Phase 1',          'sequence' => 1, 'max_score' => 25,  'pass_score' => 16, 'is_final' => false],
            ['key' => 'phase_2',    'label' => 'Phase 2',          'sequence' => 2, 'max_score' => 50,  'pass_score' => 25, 'is_final' => false],
            ['key' => 'phase_3_1',  'label' => 'Phase 3.1',        'sequence' => 3, 'max_score' => 25,  'pass_score' => 16, 'is_final' => false],
            ['key' => 'phase_3_2',  'label' => 'Phase 3.2',        'sequence' => 4, 'max_score' => 25,  'pass_score' => 16, 'is_final' => false],
            ['key' => 'phase_4',    'label' => 'Phase 4',          'sequence' => 5, 'max_score' => 30,  'pass_score' => 15, 'is_final' => false],
            ['key' => 'final_exam', 'label' => 'Final Examination', 'sequence' => 6, 'max_score' => 100, 'pass_score' => 60, 'is_final' => true],
        ];

        $rows = array_map(fn (array $row) => $row + [
            'active' => true,
            'created_at' => $now,
            'updated_at' => $now,
        ], $rows);

        DB::table('grade_components')->upsert(
            $rows,
            ['key'],
            ['label', 'sequence', 'max_score', 'pass_score', 'is_final', 'active', 'updated_at'],
        );
    }
}
