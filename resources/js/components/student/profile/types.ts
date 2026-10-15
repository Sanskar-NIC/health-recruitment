import type { ProfileOptionsData, UploadRule } from '@/lib/profile';

export interface StepProps<T> {
    data: T;
    set: (patch: T extends unknown[] ? T : Partial<T>) => void;
    /** Server validation message for a field path (e.g. "permanent.pincode"). */
    err: (path: string) => string | undefined;
    options: ProfileOptionsData;
    rules: Record<string, UploadRule>;
}
