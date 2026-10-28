import { CircleAlert, CircleCheck, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Field, NativeSelect, StepCard } from '@/components/admin/recruitment/ui';
import type { StepProps } from '@/components/admin/recruitment/ui';
import type { PostForm } from '@/components/admin/recruitment/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';

const sum = (values: string[]) => values.reduce((t, v) => t + (Number(v) || 0), 0);

/** Step 3 */
export function VacancyStep({ form, update, errors, options }: StepProps) {
    return (
        <StepCard title="Vacancy Breakup" description="Category-wise vacancies must add up to the post's total. Women, Ex-Servicemen, PwBD and districts are optional.">
            {form.posts.map((post, i) => {
                const total = Number(post.total_vacancies) || 0;
                const catSum = sum(Object.values(post.category_breakup));
                const ok = total > 0 && catSum === total;
                const districtSum = sum(post.district_breakup.map((d) => d.vacancies));
                const usedDistricts = post.district_breakup.map((d) => d.district);

                if (post.is_contractual) {
                    return <ContractualVacancy key={i} index={i} post={post} total={total} catSum={catSum} ok={ok} update={update} errors={errors} options={options} />;
                }

                return <RegularVacancy key={i} index={i} post={post} total={total} catSum={catSum} ok={ok} districtSum={districtSum} usedDistricts={usedDistricts} update={update} errors={errors} options={options} />;
            })}
        </StepCard>
    );
}

type Shared = Pick<StepProps, 'update' | 'options'> & { index: number; post: PostForm };

/** Category rows: vacancies per category, women inside it, and the open (non-women) seats worked out. */
function CategoryTable({ index: i, post, update, options, withExServiceman = false, entry = 'total' }: Shared & { withExServiceman?: boolean; entry?: 'total' | 'open' }) {
    // "open" mirrors advertisements that print Open and Female seats side by side; the category total is their sum.
    if (entry === 'open') {
        return (
            <div className="overflow-x-auto">
                <table className="w-full min-w-120 text-sm">
                    <thead>
                        <tr className="text-left text-muted-foreground">
                            <th className="pb-2 pr-3 font-medium">Category</th>
                            <th className="pb-2 pr-3 font-medium">Open</th>
                            <th className="pb-2 pr-3 font-medium">Female</th>
                            <th className="pb-2 font-medium">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {options.categories.map((c) => {
                            const women = Number(post.horizontal.women[c]) || 0;
                            const count = Number(post.category_breakup[c]) || 0;
                            const open = Math.max(count - women, 0);
                            const shown = (n: number, raw: string | undefined) => (raw === undefined || raw === '' ? '' : String(n));
                            const setSeats = (nextOpen: number, nextWomen: number) => update((d) => {
                                d.posts[i].category_breakup[c] = nextOpen + nextWomen > 0 ? String(nextOpen + nextWomen) : '';
                                d.posts[i].horizontal.women[c] = nextWomen > 0 ? String(nextWomen) : '';
                            });

                            return (
                                <tr key={c}>
                                    <td className="py-1.5 pr-3 font-semibold">{c}</td>
                                    <td className="py-1.5 pr-3"><Input type="number" min={0} value={shown(open, post.category_breakup[c])} onChange={(e) => setSeats(Number(e.target.value) || 0, women)} /></td>
                                    <td className="py-1.5 pr-3"><Input type="number" min={0} value={post.horizontal.women[c] ?? ''} onChange={(e) => setSeats(open, Number(e.target.value) || 0)} /></td>
                                    <td className="py-1.5 font-medium tabular-nums">{count > 0 ? count : '–'}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full min-w-120 text-sm">
                <thead>
                    <tr className="text-left text-muted-foreground">
                        <th className="pb-2 pr-3 font-medium">Category</th>
                        <th className="pb-2 pr-3 font-medium">Vacancies</th>
                        <th className="pb-2 pr-3 font-medium">incl. Women <span className="font-normal">(optional)</span></th>
                        <th className="pb-2 pr-3 font-medium">Open <span className="font-normal">(rest)</span></th>
                        {withExServiceman && <th className="pb-2 font-medium">incl. Ex-Serviceman <span className="font-normal">(optional)</span></th>}
                    </tr>
                </thead>
                <tbody>
                    {options.categories.map((c) => {
                        const count = Number(post.category_breakup[c]) || 0;
                        const women = Number(post.horizontal.women[c]) || 0;
                        const over = (v: string) => (Number(v) || 0) > count;

                        return (
                            <tr key={c}>
                                <td className="py-1.5 pr-3 font-semibold">{c}</td>
                                <td className="py-1.5 pr-3"><Input type="number" min={0} value={post.category_breakup[c] ?? ''} onChange={(e) => update((d) => { d.posts[i].category_breakup[c] = e.target.value; })} /></td>
                                <td className="py-1.5 pr-3"><Input type="number" min={0} value={post.horizontal.women[c] ?? ''} aria-invalid={over(post.horizontal.women[c] ?? '')} onChange={(e) => update((d) => { d.posts[i].horizontal.women[c] = e.target.value; })} /></td>
                                <td className="py-1.5 pr-3 tabular-nums text-muted-foreground">{count > 0 ? Math.max(count - women, 0) : '–'}</td>
                                {withExServiceman && (
                                    <td className="py-1.5"><Input type="number" min={0} value={post.horizontal.ex_serviceman[c] ?? ''} aria-invalid={over(post.horizontal.ex_serviceman[c] ?? '')} onChange={(e) => update((d) => { d.posts[i].horizontal.ex_serviceman[c] = e.target.value; })} /></td>
                                )}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

/** Regular posts: the category roster is optional, since some advertisements only state the total. */
function RegularVacancy({ index: i, post, total, catSum, ok, districtSum, usedDistricts, update, errors, options }: Shared & Pick<StepProps, 'errors'> & { total: number; catSum: number; ok: boolean; districtSum: number; usedDistricts: string[] }) {
    const [withBreakup, setWithBreakup] = useState(catSum > 0 || total === 0);

    const toggle = (on: boolean) => {
        setWithBreakup(on);

        if (!on) {
            update((d) => {
                for (const c of options.categories) {
                    d.posts[i].category_breakup[c] = '';
                    d.posts[i].horizontal.women[c] = '';
                    d.posts[i].horizontal.ex_serviceman[c] = '';
                }
            });
        }
    };

    return (
        <div key={i} className="grid gap-5 rounded-lg border bg-muted/30 p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-primary-deep">{post.name || `Post ${i + 1}`} · {total} vacancies</h3>
                {withBreakup && (
                    <span className={`flex items-center gap-1.5 text-sm font-medium ${ok ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {ok ? <CircleCheck className="size-4" aria-hidden="true" /> : <CircleAlert className="size-4" aria-hidden="true" />}
                        Category total {catSum} / {total}
                    </span>
                )}
            </div>

            <div className="flex items-center justify-between gap-4 rounded-lg border bg-card p-3">
                <div>
                    <p className="text-sm font-medium">Category-wise vacancy breakup</p>
                    <p className="text-xs text-muted-foreground">Turn off if the advertisement does not list UR / SC / ST / OBC / EWS seats for this post.</p>
                </div>
                <Switch checked={withBreakup} onCheckedChange={toggle} aria-label="Category-wise vacancy breakup" />
            </div>

            {withBreakup && (
                <div>
                    <p className="mb-1 text-sm font-medium">Category-wise vacancies</p>
                    <p className="mb-3 text-xs text-muted-foreground">Women and Ex-Servicemen seats are optional and are counted <em>inside</em> the category (e.g. UR 116 including 39 for women).</p>
                    <CategoryTable index={i} post={post} update={update} options={options} withExServiceman />
                    {errors[`posts.${i}.category_breakup`] && <p role="alert" className="mt-2 text-xs font-medium text-destructive">{errors[`posts.${i}.category_breakup`]}</p>}
                    {errors[`posts.${i}.horizontal`] && <p role="alert" className="mt-2 text-xs font-medium text-destructive">{errors[`posts.${i}.horizontal`]}</p>}
                </div>
            )}

            <Field label="Posts reserved for persons with disabilities (PwBD)" className="max-w-sm">
                <Input type="number" min={0} value={post.horizontal.pwbd} onChange={(e) => update((d) => { d.posts[i].horizontal.pwbd = e.target.value; })} />
            </Field>

            <div>
                <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-medium">District-wise <span className="font-normal text-muted-foreground">(optional{districtSum > 0 ? ` · ${districtSum} / ${total}` : ''})</span></p>
                    <Button type="button" variant="outline" size="sm" onClick={() => update((d) => { d.posts[i].district_breakup.push({ district: options.districts.find((x) => !usedDistricts.includes(x)) ?? '', vacancies: '' }); })}>
                        <Plus /> Add district
                    </Button>
                </div>
                {post.district_breakup.map((row, k) => (
                    <div key={k} className="mb-2 flex items-center gap-2">
                        <NativeSelect className="max-w-56" value={row.district} onChange={(e) => update((d) => { d.posts[i].district_breakup[k].district = e.target.value; })}>
                            {options.districts.map((x) => <option key={x} value={x} disabled={usedDistricts.includes(x) && x !== row.district}>{x}</option>)}
                        </NativeSelect>
                        <Input className="max-w-32" type="number" min={0} value={row.vacancies} onChange={(e) => update((d) => { d.posts[i].district_breakup[k].vacancies = e.target.value; })} />
                        <Button type="button" variant="ghost" size="icon" aria-label="Remove district" onClick={() => update((d) => { d.posts[i].district_breakup.splice(k, 1); })}>
                            <Trash2 className="text-destructive" />
                        </Button>
                    </div>
                ))}
                {errors[`posts.${i}.district_breakup`] && <p role="alert" className="text-xs font-medium text-destructive">{errors[`posts.${i}.district_breakup`]}</p>}
            </div>
        </div>

    );
}

/** Contractual posts have no roster by default, but some advertisements still list one. */
function ContractualVacancy({ index: i, post, total, catSum, ok, update, errors, options }: Shared & Pick<StepProps, 'errors'> & { total: number; catSum: number; ok: boolean }) {
    const [withBreakup, setWithBreakup] = useState(catSum > 0);

    const toggle = (on: boolean) => {
        setWithBreakup(on);

        if (!on) {
            update((d) => {
                for (const c of options.categories) {
                    d.posts[i].category_breakup[c] = '';
                    d.posts[i].horizontal.women[c] = '';
                }
            });
        }
    };

    return (
        <div className="grid gap-5 rounded-lg border bg-muted/30 p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <h3 className="text-sm font-semibold text-primary-deep">{post.name || `Post ${i + 1}`} · {total} vacancies · Contractual</h3>
                <Field label="Reserved for (optional)" className="w-48">
                    <NativeSelect value={post.reserved_for} onChange={(e) => update((d) => { d.posts[i].reserved_for = e.target.value; })}>
                        <option value="">Unreserved / as notified</option>
                        {options.categories.map((c) => <option key={c} value={c}>{c}</option>)}
                    </NativeSelect>
                </Field>
            </div>

            <div className="flex items-center justify-between gap-4 rounded-lg border bg-card p-3">
                <div>
                    <p className="text-sm font-medium">Category-wise vacancy breakup</p>
                    <p className="text-xs text-muted-foreground">Turn on if the advertisement lists UR / ST / SC seats for this post.</p>
                </div>
                <Switch checked={withBreakup} onCheckedChange={toggle} aria-label="Category-wise vacancy breakup" />
            </div>

            {withBreakup && (
                <div>
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                        <p className="text-xs text-muted-foreground">Split the post's total of {total} across categories, as Open and Female seats in the advertisement.</p>
                        <span className={`flex items-center gap-1.5 text-sm font-medium ${ok ? 'text-emerald-700' : 'text-amber-700'}`}>
                            {ok ? <CircleCheck className="size-4" aria-hidden="true" /> : <CircleAlert className="size-4" aria-hidden="true" />}
                            {catSum === total ? `All ${total} seats assigned` : catSum < total ? `${total - catSum} of ${total} seats left to assign` : `${catSum - total} seats over the total of ${total}`}
                        </span>
                    </div>
                    <CategoryTable index={i} post={post} update={update} options={options} entry="open" />
                    {errors[`posts.${i}.category_breakup`] && <p role="alert" className="mt-2 text-xs font-medium text-destructive">{errors[`posts.${i}.category_breakup`]}</p>}
                    {errors[`posts.${i}.horizontal`] && <p role="alert" className="mt-2 text-xs font-medium text-destructive">{errors[`posts.${i}.horizontal`]}</p>}
                </div>
            )}
        </div>
    );
}
