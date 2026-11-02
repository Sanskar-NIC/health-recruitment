import { Accessibility, ALargeSmall, Contrast, Link2, MoveHorizontal, Palette, RotateCcw, Zap } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { isA11yDefault, resetA11y, setA11y, SIZES, useA11y } from '@/lib/accessibility';
import type { A11yPrefs } from '@/lib/accessibility';
import { cn } from '@/lib/utils';

const iconButton = 'inline-flex size-10 items-center justify-center rounded-full border bg-card text-muted-foreground transition-colors hover:bg-primary-tint hover:text-primary focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none';

const toggles: { key: Exclude<keyof A11yPrefs, 'size'>; label: string; hint: string; icon: LucideIcon }[] = [
    { key: 'contrast', label: 'High contrast', hint: 'Stronger contrast between text and background', icon: Contrast },
    { key: 'grayscale', label: 'Grayscale', hint: 'Remove all colour from the page', icon: Palette },
    { key: 'links', label: 'Highlight links', hint: 'Underline and outline every link', icon: Link2 },
    { key: 'spacing', label: 'Text spacing', hint: 'More space between letters, words and lines', icon: MoveHorizontal },
    { key: 'motion', label: 'Stop animations', hint: 'Turn off movement and transitions', icon: Zap },
];

/** Header tools: quick text-size and contrast buttons, plus a dialog with every accessibility option. */
export function AccessibilityTools({ className }: { className?: string }) {
    const prefs = useA11y();
    const step = (dir: 1 | -1) => {
        const next = SIZES[Math.min(Math.max(SIZES.indexOf(prefs.size as (typeof SIZES)[number]) + dir, 0), SIZES.length - 1)];

        setA11y({ size: next });
    };

    return (
        <div className={cn('flex items-center gap-1.5', className)}>
            <div className="hidden items-center gap-1.5 md:flex">
                <button type="button" className={iconButton} onClick={() => step(-1)} disabled={prefs.size === SIZES[0]} aria-label="Decrease text size" title="Decrease text size">
                    <ALargeSmall className="size-4" aria-hidden="true" />
                </button>
                <button type="button" className={cn(iconButton, 'text-sm font-bold')} onClick={() => step(1)} disabled={prefs.size === SIZES[SIZES.length - 1]} aria-label="Increase text size" title="Increase text size">
                    A<span aria-hidden="true">+</span>
                </button>
                <button type="button" className={cn(iconButton, prefs.contrast && 'border-primary bg-primary-tint text-primary')} onClick={() => setA11y({ contrast: !prefs.contrast })} aria-pressed={prefs.contrast} aria-label="High contrast" title="High contrast">
                    <Contrast className="size-4" aria-hidden="true" />
                </button>
            </div>

            <Dialog>
                <DialogTrigger asChild>
                    <button type="button" className={cn(iconButton, !isA11yDefault(prefs) && 'border-primary bg-primary-tint text-primary')} aria-label="Accessibility options" title="Accessibility options">
                        <Accessibility className="size-[18px]" aria-hidden="true" />
                    </button>
                </DialogTrigger>
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Accessibility</DialogTitle>
                        <DialogDescription>Adjust how this site looks. Your choices are remembered on this device.</DialogDescription>
                    </DialogHeader>

                    <section aria-labelledby="a11y-size" className="grid gap-2">
                        <h3 id="a11y-size" className="text-sm font-semibold">Text size</h3>
                        <div role="group" aria-labelledby="a11y-size" className="grid grid-cols-4 gap-2">
                            {SIZES.map((s, i) => (
                                <button
                                    key={s}
                                    type="button"
                                    aria-pressed={prefs.size === s}
                                    onClick={() => setA11y({ size: s })}
                                    className={cn('flex h-12 flex-col items-center justify-center rounded-lg border text-xs transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none', prefs.size === s ? 'border-primary bg-primary-tint font-semibold text-primary' : 'hover:bg-muted')}
                                >
                                    <span style={{ fontSize: 12 + i * 3 }} className="leading-none font-semibold" aria-hidden="true">A</span>
                                    {s}%
                                </button>
                            ))}
                        </div>
                    </section>

                    <ul className="grid gap-2">
                        {toggles.map(({ key, label, hint, icon: Icon }) => (
                            <li key={key}>
                                <button
                                    type="button"
                                    role="switch"
                                    aria-checked={prefs[key]}
                                    onClick={() => setA11y({ [key]: !prefs[key] })}
                                    className={cn('flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none', prefs[key] ? 'border-primary bg-primary-tint' : 'hover:bg-muted')}
                                >
                                    <Icon className={cn('size-5 shrink-0', prefs[key] ? 'text-primary' : 'text-muted-foreground')} aria-hidden="true" />
                                    <span className="min-w-0 flex-1">
                                        <span className="block text-sm font-medium">{label}</span>
                                        <span className="block text-xs text-muted-foreground">{hint}</span>
                                    </span>
                                    <span className={cn('text-xs font-semibold', prefs[key] ? 'text-primary' : 'text-muted-foreground')}>{prefs[key] ? 'On' : 'Off'}</span>
                                </button>
                            </li>
                        ))}
                    </ul>

                    <Button variant="outline" disabled={isA11yDefault(prefs)} onClick={resetA11y}><RotateCcw /> Reset to default</Button>
                </DialogContent>
            </Dialog>
        </div>
    );
}
