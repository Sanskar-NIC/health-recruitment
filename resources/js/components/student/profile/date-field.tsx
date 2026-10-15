import { format, isValid, parseISO } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { useState } from 'react';
import { FormField } from '@/components/student/form-field';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface DateFieldProps {
    id: string;
    label: string;
    /** ISO date (YYYY-MM-DD) or empty string. */
    value: string;
    onChange: (value: string) => void;
    required?: boolean;
    error?: string;
    hint?: string;
    disabled?: boolean;
    /** Allow dates up to today only (default true). */
    pastOnly?: boolean;
}

export function DateField({ id, label, value, onChange, required, error, hint, disabled, pastOnly = true }: DateFieldProps) {
    const [open, setOpen] = useState(false);
    const parsed = value ? parseISO(value) : undefined;
    const selected = parsed && isValid(parsed) ? parsed : undefined;
    const thisYear = new Date().getFullYear();

    return (
        <FormField id={id} label={label} required={required} error={error} hint={hint}>
            {(aria) => (
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            {...aria}
                            type="button"
                            variant="outline"
                            disabled={disabled}
                            className={cn('h-11 w-full justify-start px-3 font-normal', !selected && 'text-muted-foreground', disabled && 'bg-muted/50')}
                        >
                            <CalendarIcon className="mr-2 size-4" />
                            {selected ? format(selected, 'dd-MMM-yyyy') : 'Select date'}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent>
                        <Calendar
                            mode="single"
                            captionLayout="dropdown"
                            selected={selected}
                            defaultMonth={selected}
                            startMonth={new Date(1950, 0)}
                            endMonth={new Date(pastOnly ? thisYear : thisYear + 10, 11)}
                            disabled={pastOnly ? { after: new Date() } : undefined}
                            onSelect={(d) => {
                                onChange(d ? format(d, 'yyyy-MM-dd') : '');
                                setOpen(false);
                            }}
                        />
                    </PopoverContent>
                </Popover>
            )}
        </FormField>
    );
}
