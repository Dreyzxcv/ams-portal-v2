export type ViolationRow = {
    id: number;
    trainee_name: string | null;
    trainee_username: string | null;
    issued_by: string | null;
    occurred_on: string | null;
    description: string;
    can_edit: boolean;
};

export type TraineeOption = {
    id: number;
    name: string;
    username: string;
};