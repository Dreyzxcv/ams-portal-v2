export type BatchRow = {
    id: number;
    name: string;
    starts_on: string | null;
    trainee_count: number;
};

export type BatchMember = {
    id: number;
    user_id: number;
    name: string | null;
    username: string | null;
    assigned_at: string | null;
};

export type AvailableTrainee = {
    id: number;
    name: string;
    username: string;
    current_batch: string | null;
};