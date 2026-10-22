export type StatItem = { label: string; value: number; href: string | null };
export type StatGroup = { title: string; stats: StatItem[] };
export type TrendSeries = { label: string; values: number[] };

export type Trend = {
    weeks: string[];
    series: TrendSeries[];
};

export type TraineeComponent = {
    name: string;
    score: number | null;
    max: number | null;
    passed: boolean | null;
};

export type ActivityItem = {
    id: number;
    occurred_at: string | null;
    actor: string;
    action: string;
    subject: string | null;
};

export type TraineeSummary = {
    batch: string | null;
    current_phase: number | null;
    started_on: string | null;
    components?: TraineeComponent[];
    grades_total: number;
    grades_entered: number;
    grades_passed: number;
    violations: number;
    certificate_id: number | null;
    certificate_number: string | null;
    certificate_issued_at: string | null;
    remaining_days: number | null;
};

export type BatchSummary = { id: number; name: string; members: number };