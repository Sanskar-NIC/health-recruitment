import { ExternalLink, Loader2, Trash2, Upload } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { ApiError, profileFileUrl, uploadProfileFile } from '@/api/profile.api';
import { FormField } from '@/components/student/form-field';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { fieldIcons } from '@/components/student/profile/field-icons';
import type { FileRef, UploadRule } from '@/lib/profile';
import { cn } from '@/lib/utils';

interface Common {
    id: string;
    label: string;
    required?: boolean;
    error?: string;
    className?: string;
    icon?: LucideIcon;
}

const iconFor = (id: string, icon?: LucideIcon): LucideIcon | undefined => icon ?? fieldIcons[id.split('-').pop() ?? ''];

export function Section({ title, icon: Icon, children }: { title: string; icon?: LucideIcon; children: ReactNode }) {
    return (
        <fieldset className="grid gap-5">
            <legend className="sr-only">{title}</legend>
            <div aria-hidden="true" className="flex items-center gap-3 rounded-xl border-l-4 border-primary bg-primary-tint px-4 py-3 text-primary-deep">
                {Icon && <Icon className="size-5 text-primary" />}
                <span className="text-base font-semibold">{title}</span>
            </div>
            <div className="grid gap-x-6 gap-y-5 md:grid-cols-2">{children}</div>
        </fieldset>
    );
}

interface TextFieldProps extends Common {
    value: string;
    onChange: (value: string) => void;
    type?: string;
    readOnly?: boolean;
    inputMode?: 'text' | 'numeric' | 'decimal';
    maxLength?: number;
    placeholder?: string;
    max?: string;
}

export function TextField({ value, onChange, type = 'text', readOnly, inputMode, maxLength, placeholder, max, ...common }: TextFieldProps) {
    const Icon = iconFor(common.id, common.icon);

    return (
        <FormField {...common}>
            {(aria) => (
                <div className="relative">
                    {Icon && <Icon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-primary/70" aria-hidden="true" />}
                    <Input
                        {...aria}
                        type={type}
                        value={value}
                        readOnly={readOnly}
                        inputMode={inputMode}
                        maxLength={maxLength}

                        max={max}
                        onChange={(e) => onChange(e.target.value)}
                        className={cn('h-11', Icon && 'pl-10', readOnly && 'cursor-not-allowed bg-muted/50')}
                    />
                </div>
            )}
        </FormField>
    );
}

interface SelectFieldProps extends Common {
    value: string;
    onChange: (value: string) => void;
    options: string[];
    placeholder?: string;
}

export function SelectField({ value, onChange, options, placeholder = '-- Please Select --', ...common }: SelectFieldProps) {
    const Icon = iconFor(common.id, common.icon);

    return (
        <FormField {...common}>
            {(aria) => (
                <Select value={value} onValueChange={onChange}>
                    <SelectTrigger {...aria} className="h-11 w-full">
                        {Icon && <Icon className="size-4 shrink-0 text-primary/70" aria-hidden="true" />}
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {options.map((o) => (
                            <SelectItem key={o} value={o}>{o}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )}
        </FormField>
    );
}

interface YesNoFieldProps extends Common {
    value: string;
    onChange: (value: 'yes' | 'no') => void;
}

/** Yes/No question rendered as a switch (off = No). */
export function YesNoField({ value, onChange, ...common }: YesNoFieldProps) {
    return (
        <FormField {...common} icon={iconFor(common.id, common.icon)}>
            {(aria) => (
                <div className="flex min-h-11 items-center gap-3">
                    <Switch {...aria} checked={value === 'yes'} onCheckedChange={(on) => onChange(on ? 'yes' : 'no')} />
                    <span className="text-sm font-medium">{value === 'yes' ? 'Yes' : 'No'}</span>
                </div>
            )}
        </FormField>
    );
}

interface FileFieldProps extends Common {
    /** Upload slot name understood by the server (see ProfileOptions::UPLOADS). */
    field: string;
    value: FileRef | null;
    onChange: (value: FileRef | null) => void;
    rule: UploadRule;
    image?: boolean;
}

export function FileField({ field, value, onChange, rule, image, ...common }: FileFieldProps) {
    const input = useRef<HTMLInputElement>(null);
    const [busy, setBusy] = useState(false);
    const [uploadError, setUploadError] = useState<string>();

    const pick = async (file: File | undefined) => {
        if (!file) {
            return;
        }

        setBusy(true);
        setUploadError(undefined);

        try {
            onChange(await uploadProfileFile(field, file));
        } catch (e) {
            setUploadError(e instanceof ApiError ? e.message : 'Upload failed. Please try again.');
        } finally {
            setBusy(false);

            if (input.current) {
                input.current.value = '';
            }
        }
    };

    return (
        <FormField
            {...common}
            icon={iconFor(common.id, common.icon)}
            error={uploadError ?? common.error}
        >
            {(aria) => (
                <div className="grid gap-2">
                    <input
                        ref={input}
                        {...aria}
                        type="file"
                        accept={rule.mimes.split(',').map((m) => `.${m}`).join(',')}
                        className="sr-only"
                        onChange={(e) => pick(e.target.files?.[0])}
                    />
                    <div className="flex flex-wrap items-center gap-3 rounded-md border bg-muted/20 p-3">
                        {image && value && (
                            <img src={profileFileUrl(value.path)} alt={`${common.label} preview`} className="max-h-24 rounded border bg-white object-contain" />
                        )}
                        <div className="min-w-0 flex-1 text-sm">
                            {value ? <span className="block truncate font-medium">{value.name}</span> : <span className="text-muted-foreground">No file chosen</span>}
                        </div>
                        <Button type="button" variant="outline" size="sm" disabled={busy} onClick={() => input.current?.click()}>
                            {busy ? <Loader2 className="mr-1.5 size-4 animate-spin" /> : <Upload className="mr-1.5 size-4" />}
                            {value ? 'Replace' : 'Choose file'}
                        </Button>
                        {value && (
                            <>
                                <Button type="button" variant="ghost" size="icon" asChild aria-label="View file">
                                    <a href={profileFileUrl(value.path)} target="_blank" rel="noreferrer"><ExternalLink className="size-4" /></a>
                                </Button>
                                <Button type="button" variant="ghost" size="icon" aria-label="Remove file" onClick={() => onChange(null)}>
                                    <Trash2 className="size-4 text-destructive" />
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </FormField>
    );
}
