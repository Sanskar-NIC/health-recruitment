import type { ReactNode } from 'react';

interface SectionHeadingProps {
    title: string;
    description?: string;
    action?: ReactNode;
    id?: string;
}

export function SectionHeading({
    title,
    description,
    action,
    id,
}: SectionHeadingProps) {
    return (
        <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
            <div>
                <span aria-hidden="true" className="mb-2 block h-1 w-10 rounded-full bg-primary" />
                <h2 id={id} className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                    {title}
                </h2>
                {description && (
                    <p className="mt-0.5 text-sm text-muted-foreground">
                        {description}
                    </p>
                )}
            </div>
            {action}
        </div>
    );
}
