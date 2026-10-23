export type QuizQuestionInput = {
    id?: number;
    type: 'multiple_choice' | 'paragraph';
    prompt: string;
    points: string;
    options: string[] | null;
    correct_option: number | null;
};

export type QuizInput = {
    grade_component_key: string;
    title: string;
    instructions: string;
    duration_minutes: number | string;
    questions: QuizQuestionInput[];
};

export type QuizListRow = {
    id: number;
    title: string;
    phase: string;
    question_count: number;
    attempt_count: number;
};

export type QuizAttemptAnswer = {
    question_id: number;
    selected_option?: number;
    answer_text?: string;
};

export type QuizAttemptEvent =
    | 'page_hidden'
    | 'page_visible'
    | 'window_blur'
    | 'window_focus'
    | 'fullscreen_entered'
    | 'fullscreen_exited'
    | 'fullscreen_unsupported';