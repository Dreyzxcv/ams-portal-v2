export type ProgressRow = {
    id: number;
    name: string;
    username: string;
    current_phase: number | null;
    started_on: string | null;
    remaining_days: number | null;
    batch_ended: boolean;
    updated_at: string | null;
    updated_by: string | null;
};