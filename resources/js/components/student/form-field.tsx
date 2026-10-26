import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { FieldError } from '@/components/student/field-error';
import { RequiredMark } from '@/components/student/required-mark';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export interface FieldAria {
    id: string;
    'aria-invalid': boolean;
    'aria-describedby'?: string;
}

interface FormFieldProps {
    id: string;
    label: string;
    required?: boolean;
    error?: string;
    icon?: LucideIcon;
    className?: string;
    children: (aria: FieldAria) => ReactNode;
}

export function FormField({ id, label, required, error, icon: Icon, className, children }: FormFieldProps) {
    const describedBy = [error ? `${id}-error` : null].filter(Boolean).join(' ');

    return (
        <div className={cn('grid content-start gap-2', className)}>
            <Label htmlFor={id} className="flex items-center gap-2">
                {Icon && <Icon className="size-4 text-primary" aria-hidden="true" />}
                {label}
                {required && <RequiredMark />}
            </Label>
            {children({
                id,
                'aria-invalid': Boolean(error),
                'aria-describedby': describedBy || undefined,
            })}
            {error && <FieldError id={`${id}-error`} message={error} />}
        </div>
    );
}
