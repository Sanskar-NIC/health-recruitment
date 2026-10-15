import type { FileRef, ServerProfile, StepKey } from '@/lib/profile';

export class ApiError extends Error {
    constructor(
        message: string,
        public errors: Record<string, string> = {},
    ) {
        super(message);
    }
}

function xsrf(): string {
    const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);

    return match ? decodeURIComponent(match[1]) : '';
}

async function request<T>(url: string, init: RequestInit): Promise<T> {
    const response = await fetch(url, {
        credentials: 'same-origin',
        ...init,
        headers: {
            Accept: 'application/json',
            'X-XSRF-TOKEN': xsrf(),
            ...(init.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
            ...init.headers,
        },
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
        const raw = (result.errors ?? {}) as Record<string, string[]>;
        const errors = Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, v[0]]));

        throw new ApiError(Object.values(errors)[0] ?? result.message ?? 'Something went wrong. Please try again.', errors);
    }

    return result as T;
}

interface SaveResponse {
    message: string;
    profile: ServerProfile;
}

export const saveProfileStep = (step: StepKey, data: unknown, draft: boolean) =>
    request<SaveResponse>(`/student/profile/${step}`, { method: 'PUT', body: JSON.stringify({ data, draft }) });

export const submitProfile = () => request<SaveResponse>('/student/profile/submit', { method: 'POST' });

export function uploadProfileFile(field: string, file: File): Promise<FileRef> {
    const body = new FormData();

    body.append('field', field);
    body.append('file', file);

    return request<FileRef>('/student/profile/upload', { method: 'POST', body });
}

export const profileFileUrl = (path: string) => `/student/profile/file?path=${encodeURIComponent(path)}`;
