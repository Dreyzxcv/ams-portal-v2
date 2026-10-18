export type UserRow = {
    id: number;
    name: string;
    username: string;
    email: string | null;
    role: string | null;
    role_label: string | null;
    status: string | null;
    force_password_change: boolean;
    last_login_at: string | null;
};

export type RoleOption = { value: string; label: string };

export type Paginated<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
    from: number | null;
    to: number | null;
    prev_page_url: string | null;
    next_page_url: string | null;
};

export type Credentials = { username: string; password: string };