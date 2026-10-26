import { Plus, Trash2 } from 'lucide-react';
import { FileField, SelectField, TextField } from '@/components/student/profile/fields';
import type { StepProps } from '@/components/student/profile/types';
import { Button } from '@/components/ui/button';
import { emptyQualification } from '@/lib/profile';
import type { Qualification } from '@/lib/profile';

const MAX_ROWS = 10;
const SSC_TYPE = 'SSC/Madhyamik';
const HSC_TYPE = 'HSC/Higher Secondary';
const GENERAL_STREAM = 'General / All Subjects';

/** SSC has one fixed stream, HSC picks from a list, every other type is typed in. */
const streamMode = (type: string) => (type === SSC_TYPE ? 'fixed' : type === HSC_TYPE ? 'list' : 'text');

export function QualificationsStep({ data, set, err, options, rules }: StepProps<Qualification[]>) {
    const update = (index: number, patch: Partial<Qualification>) =>
        set(
            data.map((row, i) => {
                if (i !== index) {
                    return row;
                }

                const next = { ...row, ...patch };

                // The stream input changes shape with the type, so a value from another mode is dropped.
                if (patch.type !== undefined && streamMode(patch.type) !== streamMode(row.type)) {
                    next.stream = patch.type === SSC_TYPE ? GENERAL_STREAM : '';
                }

                // Percentage is derived for MARKS and entered by hand otherwise.
                if (next.marks_type === 'MARKS') {
                    const total = parseFloat(next.out_of);
                    const got = parseFloat(next.obtained);

                    next.percentage = total > 0 && got >= 0 ? String(Math.round((got / total) * 10000) / 100) : '';
                }

                return next;
            }),
        );

    const add = () => set([...data, { ...emptyQualification }]);
    const remove = (index: number) => set(data.filter((_, i) => i !== index));

    return (
        <div className="grid gap-6">
            {data.length === 0 && (
                <p className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
                    No qualification added yet. Click “Add Qualification” to begin.
                </p>
            )}
            {err('qualifications') && <p role="alert" className="text-sm text-destructive">{err('qualifications')}</p>}

            {data.map((q, i) => {
                const e = (key: string) => err(`qualifications.${i}.${key}`);
                const byMarks = q.marks_type === 'MARKS';
                const byPct = q.marks_type === 'PERCENTAGE';
                const id = (key: string) => `q${i}-${key}`;

                return (
                    <fieldset key={i} className="rounded-xl border bg-muted/10 p-4">
                        <legend className="flex items-center gap-3 px-2 text-sm font-semibold text-primary-deep">
                            Qualification {i + 1}
                            {data.length > 1 && (
                                <Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={() => remove(i)}>
                                    <Trash2 className="mr-1 size-4" /> Remove
                                </Button>
                            )}
                        </legend>
                        <div className="grid gap-4 md:grid-cols-2">
                            <SelectField id={id('type')} label="Qualification Type" required value={q.type} onChange={(v) => update(i, { type: v })} options={options.qualificationTypes} error={e('type')} />
                            {streamMode(q.type) === 'text' ? (
                                <TextField id={id('stream')} label="Branch/Stream" required maxLength={100} value={q.stream} onChange={(v) => update(i, { stream: v })} error={e('stream')} />
                            ) : (
                                <SelectField id={id('stream')} label="Branch/Stream" required value={q.stream} onChange={(v) => update(i, { stream: v })} options={streamMode(q.type) === 'fixed' ? [GENERAL_STREAM] : options.streams} error={e('stream')} />
                            )}
                            <SelectField id={id('result_status')} label="Result Status" required value={q.result_status} onChange={(v) => update(i, { result_status: v })} options={options.resultStatuses} error={e('result_status')} />
                            <TextField id={id('year')} label="Year of Passing" required inputMode="numeric" maxLength={4} value={q.year} onChange={(v) => update(i, { year: v.replace(/\D/g, '') })} error={e('year')} />
                            <SelectField id={id('marks_type')} label="Marks Type" required value={q.marks_type} onChange={(v) => update(i, { marks_type: v })} options={options.marksTypes} error={e('marks_type')} />
                            {!byPct && (
                                <>
                                    <TextField id={id('out_of')} label="Out Of" required inputMode="decimal" value={q.out_of} onChange={(v) => update(i, { out_of: v })} error={e('out_of')} />
                                    <TextField id={id('obtained')} label={q.marks_type === 'CGPA' ? 'CGPA Obtained' : 'Marks Obtained'} required inputMode="decimal" value={q.obtained} onChange={(v) => update(i, { obtained: v })} error={e('obtained')} />
                                </>
                            )}
                            <TextField id={id('percentage')} label="Percentage" required inputMode="decimal" readOnly={byMarks} value={q.percentage} onChange={(v) => update(i, { percentage: v })} error={e('percentage')} />
                            <TextField id={id('state')} label="State" required value={q.state} onChange={(v) => update(i, { state: v })} error={e('state')} />
                            <TextField id={id('board')} label="Board/University" required value={q.board} onChange={(v) => update(i, { board: v })} error={e('board')} />
                            <FileField id={id('document')} label="Qualification Documents" required field="qualification_document" rule={rules.qualification_document} value={q.document} onChange={(v) => update(i, { document: v })} error={e('document') ?? e('document.path')} />
                        </div>
                    </fieldset>
                );
            })}

            <div>
                <Button type="button" variant="outline" disabled={data.length >= MAX_ROWS} onClick={add}>
                    <Plus className="mr-1.5 size-4" /> Add Qualification
                </Button>
            </div>
        </div>
    );
}
