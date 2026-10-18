export type GradeComponentInfo = {
    id: number;
    label: string;
    max_score: string;
    pass_score: string;
};

export type TraineeGradeRow = {
    id: number;
    name: string;
    username: string;
    scores: Record<string, string | null>;
};

export type GradeEntryRow = {
    component_id: number;
    label: string;
    max_score: string;
    pass_score: string;
    is_final: boolean;
    score: string | null;
    passed: boolean | null;
    graded_by: string | null;
    graded_at: string | null;
};

export type GradeRevisionRow = {
    id: number;
    component: string | null;
    old_score: string | null;
    new_score: string | null;
    changed_by: string | null;
    changed_at: string | null;
    reason: string | null;
};