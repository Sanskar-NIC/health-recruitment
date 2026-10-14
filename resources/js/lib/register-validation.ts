import { calculateAge } from '@/lib/portal';
import { isStrongEnough } from '@/components/student/password-strength';

export interface RegisterData {
    fullName: string;
    fatherName: string;
    motherName: string;
    dob: string;
    gender: string;
    category: string;
    pwbd: string;
    mobile: string;
    email: string;
    password: string;
    confirmPassword: string;
    declaration: boolean;
}

export type RegisterErrors = Partial<Record<keyof RegisterData, string>>;

export const emptyRegister: RegisterData = {
    fullName: '',
    fatherName: '',
    motherName: '',
    dob: '',
    gender: '',
    category: '',
    pwbd: 'no',
    mobile: '',
    email: '',
    password: '',
    confirmPassword: '',
    declaration: false,
};

export const isValidMobile = (v: string) => /^[6-9]\d{9}$/.test(v);
export const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

export function validateRegister(
    data: RegisterData,
    verified: { mobile: boolean; email: boolean },
): RegisterErrors {
    const errors: RegisterErrors = {};
    const required: [keyof RegisterData, string][] = [
        ['fullName', 'Full name'],
        ['fatherName', "Father's name"],
        ['motherName', "Mother's name"],
        ['dob', 'Date of birth'],
        ['gender', 'Gender'],
        ['category', 'Category'],
    ];

    required.forEach(([key, label]) => {
        if (!String(data[key]).trim()) {
            errors[key] = `${label} is required`;
        }
    });

    if (!data.mobile) {
        errors.mobile = 'Mobile number is required';
    } else if (!isValidMobile(data.mobile)) {
        errors.mobile = 'Enter a valid 10-digit mobile number starting with 6–9';
    } else if (!verified.mobile) {
        errors.mobile = 'Verify your mobile number with OTP';
    }

    if (!data.email) {
        errors.email = 'Email is required';
    } else if (!isValidEmail(data.email)) {
        errors.email = 'Enter a valid email address';
    } else if (!verified.email) {
        errors.email = 'Verify your email with OTP';
    }

    if (!data.password) {
        errors.password = 'Password is required';
    } else if (!isStrongEnough(data.password)) {
        errors.password = 'Password does not meet all the rules';
    }

    if (!data.confirmPassword) {
        errors.confirmPassword = 'Confirm your password';
    } else if (data.confirmPassword !== data.password) {
        errors.confirmPassword = 'Passwords do not match';
    }

    return errors;
}

/** Age 18–45 is a UI hint only, not a blocking rule. */
export function ageHint(dob: string): { age: number | null; message: string | null } {
    if (!dob) {
        return { age: null, message: null };
    }

    const age = calculateAge(dob);

    if (age === null) {
        return { age: null, message: null };
    }

    return {
        age,
        message: age < 18 || age > 45 ? 'Most recruitments require age between 18 and 45 years.' : null,
    };
}
