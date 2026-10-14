import type { RegisterData } from '@/lib/register-validation';

export interface RegisterApiResponse {
    success: boolean;
    message: string;
    registration_no: string;
}

export interface ApiValidationError {
    message: string;
    errors?: Record<string, string[]>;
}

export async function registerApplicant(data: RegisterData): Promise<RegisterApiResponse> {
    const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
        const errorData = result as ApiValidationError;
        const firstError = errorData.errors
            ? Object.values(errorData.errors)[0]?.[0]
            : errorData.message;

        const err = new Error(firstError || 'Registration failed. Please check the form.');
        (err as Error & { errors?: Record<string, string[]> }).errors = errorData.errors;
        throw err;
    }

    return result as RegisterApiResponse;
}
