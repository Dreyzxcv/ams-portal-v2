export type StatItem = { label: string; value: number; href: string | null };
export type StatGroup = { title: string; stats: StatItem[] };

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
    grades_total: number;
    grades_entered: number;
    grades_passed: number;
    violations: number;
    certificate_number: string | null;
    certificate_issued_at: string | null;
    remaining_days: number | null;
};