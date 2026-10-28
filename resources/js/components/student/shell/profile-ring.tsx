import { cn } from '@/lib/utils';

interface Props {
    completed: number;
    total: number;
    size?: number;
    className?: string;
    /** Use on dark/primary backgrounds. */
    onPrimary?: boolean;
}

/** Circular progress showing how many required profile steps are done. */
export function ProfileRing({ completed, total, size = 72, className, onPrimary = false }: Props) {
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    const stroke = Math.max(6, Math.round(size / 10));
    const radius = (size - stroke) / 2;
    const circumference = 2 * Math.PI * radius;

    return (
        <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent}
            aria-label="Profile completion"
            className={cn('relative shrink-0', className)}
            style={{ width: size, height: size }}
        >
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
                <circle cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth={stroke} className={onPrimary ? 'stroke-white/25' : 'stroke-primary-tint'} />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    strokeWidth={stroke}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference * (1 - percent / 100)}
                    className={cn('transition-[stroke-dashoffset] duration-700', onPrimary ? 'stroke-white' : 'stroke-primary')}
                />
            </svg>
            <span className={cn('absolute inset-0 flex items-center justify-center text-sm font-bold tabular-nums', onPrimary ? 'text-white' : 'text-primary-deep')}>{percent}%</span>
        </div>
    );
}
