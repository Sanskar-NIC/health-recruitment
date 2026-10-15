import { Link } from '@inertiajs/react';
import { TriangleAlert } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const SECONDS = 5;
const RADIUS = 18;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    completed: number;
    total: number;
    showProfileLink: boolean;
}

/** Shown right after login while the profile is still a draft. Closes itself after 5 seconds. */
export function ProfileIncompleteDialog({ open, onOpenChange, completed, total, showProfileLink }: Props) {
    const [left, setLeft] = useState(SECONDS);

    useEffect(() => {
        if (!open) {
            return;
        }

        setLeft(SECONDS);

        const tick = window.setInterval(() => setLeft((s) => Math.max(s - 1, 0)), 1000);
        const close = window.setTimeout(() => onOpenChange(false), SECONDS * 1000);

        return () => {
            window.clearInterval(tick);
            window.clearTimeout(close);
        };
    }, [open, onOpenChange]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader className="items-center text-center sm:text-center">
                    <span className="flex size-14 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                        <TriangleAlert className="size-7" aria-hidden="true" />
                    </span>
                    <DialogTitle className="mt-2 text-xl">Your profile is incomplete</DialogTitle>
                    <DialogDescription>
                        {completed} of {total} required steps are done. Please complete your profile before applying for any recruitment.
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="items-center sm:justify-center">
                    {showProfileLink && (
                        <Button asChild variant="outline" onClick={() => onOpenChange(false)}>
                            <Link href="/student/profile">Complete Profile</Link>
                        </Button>
                    )}
                    <Button onClick={() => onOpenChange(false)} className="relative h-11 gap-2 px-5">
                        OK
                        <span className="relative flex size-9 items-center justify-center" aria-label={`Closing in ${left} seconds`}>
                            <svg className="absolute inset-0 size-full -rotate-90" viewBox="0 0 44 44" aria-hidden="true">
                                <circle cx="22" cy="22" r={RADIUS} fill="none" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
                                {open && (
                                    <circle
                                        key={String(open)}
                                        cx="22"
                                        cy="22"
                                        r={RADIUS}
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                        strokeDasharray={CIRCUMFERENCE}
                                        style={{ animation: `profile-dialog-countdown ${SECONDS}s linear forwards` }}
                                    />
                                )}
                            </svg>
                            <span className="text-sm font-semibold tabular-nums">{left}</span>
                        </span>
                    </Button>
                </DialogFooter>
                <style>{`@keyframes profile-dialog-countdown { from { stroke-dashoffset: 0 } to { stroke-dashoffset: ${CIRCUMFERENCE} } }`}</style>
            </DialogContent>
        </Dialog>
    );
}
