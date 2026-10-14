export type StudentUser = {
    id: number;
    registration_no: string;
    full_name: string;
    father_name?: string;
    mother_name?: string;
    dob?: string;
    gender?: string;
    category?: string;
    pwbd?: string;
    mobile: string;
    email: string;
    created_at: string;
    updated_at?: string;
    [key: string]: unknown;
};

export type Auth = {
    user: User | null;
    student?: StudentUser | null;
};
