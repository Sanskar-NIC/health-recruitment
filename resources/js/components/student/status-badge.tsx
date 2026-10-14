import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { RecruitmentStatus } from '@/types/student';

const config: Record<RecruitmentStatus, { label: string; className: string }> =
    {
        open: { label: 'Open', className: 'bg-success text-white' },
        closing_soon: {
            label: 'Closing Soon',
            className: 'bg-warning text-white',
        },
        upcoming: {
            label: 'Upcoming',
            className: 'bg-primary-tint text-primary-hover',
        },
        closed: { label: 'Closed', className: 'bg-gray-200 text-gray-700' },
    };

export function StatusBadge({
    status,
    className,
}: {
    status: RecruitmentStatus;
    className?: string;
}) {
    const { label, className: color } = config[status];

    return (
        <Badge className={cn('border-transparent', color, className)}>
            {label}
        </Badge>
    );
}
