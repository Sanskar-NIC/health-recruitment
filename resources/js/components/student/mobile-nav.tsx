import { Link } from '@inertiajs/react';
import { Menu } from 'lucide-react';
import { useState } from 'react';
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/animate-ui/components/radix/sheet';
import { Button } from '@/components/ui/button';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { portalNav } from '@/lib/portal';
import { cn } from '@/lib/utils';

export function MobileNav() {
    const [open, setOpen] = useState(false);
    const { isCurrentUrl } = useCurrentUrl();

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <button
                    type="button"
                    aria-label="Open menu"
                    className="inline-flex size-11 items-center justify-center rounded-md text-white hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-white lg:hidden"
                >
                    <Menu className="size-6" aria-hidden="true" />
                </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 bg-card p-0">
                <SheetHeader className="bg-primary p-4 text-primary-foreground">
                    <SheetTitle className="text-primary-foreground">Menu</SheetTitle>
                    <SheetDescription className="sr-only">
                        Site navigation
                    </SheetDescription>
                </SheetHeader>
                <nav aria-label="Mobile" className="flex flex-col p-2">
                    {portalNav.map(({ label, href, icon: Icon }) => (
                        <SheetClose asChild key={href}>
                            <Link
                                href={href}
                                aria-current={isCurrentUrl(href) ? 'page' : undefined}
                                className={cn(
                                    'flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-medium hover:bg-primary-tint focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none',
                                    isCurrentUrl(href) && 'bg-primary-tint text-primary-hover',
                                )}
                            >
                                <Icon className="size-4" aria-hidden="true" />
                                {label}
                            </Link>
                        </SheetClose>
                    ))}
                </nav>
                <div className="mt-auto grid gap-2 border-t p-4">
                    <SheetClose asChild>
                        <Button asChild variant="outline" className="h-11 border-primary text-primary">
                            <Link href="/login">Login</Link>
                        </Button>
                    </SheetClose>
                    <SheetClose asChild>
                        <Button asChild className="h-11">
                            <Link href="/register">Register</Link>
                        </Button>
                    </SheetClose>
                    <SheetClose asChild>
                        <Button asChild variant="ghost" className="h-11 text-muted-foreground">
                            <Link href="/admin/login">Admin Login</Link>
                        </Button>
                    </SheetClose>
                </div>
            </SheetContent>
        </Sheet>
    );
}
