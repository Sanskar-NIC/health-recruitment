import type { ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { Options, RecruitmentForm } from '@/components/admin/recruitment/types';

/** Shared props for every wizard step. `update` mutates a deep copy of the form. */
export interface StepProps {
    form: RecruitmentForm;
    update: (mutate: (draft: RecruitmentForm) => void) => void;
    errors: Record<string, string>;
    options: Options;
}

export function Field({ label, error, hint, required, className, children, htmlFor }: {
    label: string;
    error?: string;
    hint?: string;
    required?: boolean;
    className?: string;
    children: ReactNode;
    htmlFor?: string;
}) {
    return (
        <div className={cn('grid content-start gap-2', className)}>
            <Label htmlFor={htmlFor}>
                {label}
                {required && <span className="ml-0.5 text-destructive" aria-hidden="true">*</span>}
            </Label>
            {children}
            {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
            {error && <p role="alert" className="text-xs font-medium text-destructive">{error}</p>}
        </div>
    );
}

const control = 'h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none transition focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-60 aria-invalid:border-destructive';

export function NativeSelect({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
    return (
        <select className={cn(control, 'bg-background', className)} {...props}>
            {children}
        </select>
    );
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
    return <textarea className={cn(control, 'h-auto min-h-24 py-2', className)} {...props} />;
}

export function StepCard({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
    return (
        <section className="rounded-xl border bg-card p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-semibold text-primary-deep">{title}</h2>
            {description && <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>}
            <div className="mt-7 grid gap-7">{children}</div>
        </section>
    );
}

export const inputClass = control;
