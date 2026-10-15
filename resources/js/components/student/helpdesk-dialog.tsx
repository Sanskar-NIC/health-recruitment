import { usePage } from '@inertiajs/react';
import { Clock, Mail, MapPin, Phone } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export function HelpdeskDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
    const { helpdesk } = (usePage().props as unknown as { portal: { helpdesk: Record<'phone' | 'email' | 'hours' | 'address', string> } }).portal;

    const rows = [
        { icon: Phone, label: 'Phone', value: helpdesk.phone, href: `tel:${helpdesk.phone.replace(/\s/g, '')}` },
        { icon: Mail, label: 'Email', value: helpdesk.email, href: `mailto:${helpdesk.email}` },
        { icon: Clock, label: 'Working hours', value: helpdesk.hours },
        { icon: MapPin, label: 'Address', value: helpdesk.address },
    ];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Helpdesk</DialogTitle>
                    <DialogDescription>Need help with your profile or application? Contact us.</DialogDescription>
                </DialogHeader>
                <ul className="grid gap-4">
                    {rows.map(({ icon: Icon, label, value, href }) => (
                        <li key={label} className="flex items-start gap-3">
                            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-tint text-primary">
                                <Icon className="size-4" aria-hidden="true" />
                            </span>
                            <div className="text-sm">
                                <p className="text-xs text-muted-foreground">{label}</p>
                                {href ? <a href={href} className="font-medium text-primary hover:underline">{value}</a> : <p className="font-medium">{value}</p>}
                            </div>
                        </li>
                    ))}
                </ul>
            </DialogContent>
        </Dialog>
    );
}
