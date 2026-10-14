import { Check, X } from 'lucide-react';
import { Progress } from '@/components/animate-ui/components/radix/progress';
import { cn } from '@/lib/utils';

export const passwordRules = [
    { id: 'length', label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
    { id: 'upper', label: 'One uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
    { id: 'number', label: 'One number', test: (p: string) => /\d/.test(p) },
    { id: 'special', label: 'One special character', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

export function passwordScore(password: string): number {
    return passwordRules.filter((rule) => rule.test(password)).length;
}

export function isStrongEnough(password: string): boolean {
    return passwordScore(password) === passwordRules.length;
}

export function PasswordStrength({ password }: { password: string }) {
    const score = passwordScore(password);
    const level =
        score <= 1
            ? { label: 'Weak', bar: '[&_[data-slot=progress-indicator]]:bg-destructive', text: 'text-destructive' }
            : score <= 3
              ? { label: 'Medium', bar: '[&_[data-slot=progress-indicator]]:bg-amber-500', text: 'text-amber-700' }
              : { label: 'Strong', bar: '[&_[data-slot=progress-indicator]]:bg-success', text: 'text-success' };

    return (
        <div className="grid gap-2" aria-live="polite">
            <div className="flex items-center gap-3">
                <Progress
                    value={password ? (score / passwordRules.length) * 100 : 0}
                    className={cn('h-2 bg-gray-200', level.bar)}
                    aria-label="Password strength"
                />
                <span className={cn('w-16 text-xs font-medium', password ? level.text : 'text-muted-foreground')}>
                    {password ? level.label : '—'}
                </span>
            </div>
            <ul className="grid gap-1 text-xs sm:grid-cols-2">
                {passwordRules.map((rule) => {
                    const ok = rule.test(password);

                    return (
                        <li
                            key={rule.id}
                            className={cn('flex items-center gap-1.5', ok ? 'text-success' : 'text-muted-foreground')}
                        >
                            {ok ? (
                                <Check className="size-3.5" aria-hidden="true" />
                            ) : (
                                <X className="size-3.5" aria-hidden="true" />
                            )}
                            {rule.label}
                            <span className="sr-only">{ok ? ' (met)' : ' (not met)'}</span>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
