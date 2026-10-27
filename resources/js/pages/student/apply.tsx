import { Head, Link, useForm } from '@inertiajs/react';
import { CircleAlert, CircleCheck, CircleX, ClipboardCheck, IdCard, ShieldCheck } from 'lucide-react';
import type { ReactNode } from 'react';
import { Panel } from '@/components/student/panel';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import StudentPortalLayout from '@/layouts/student-portal-layout';
import { formatDate } from '@/lib/portal';
import { inr } from '@/lib/recruitment';
import { cn } from '@/lib/utils';
import type { EligibilityCheck, RecruitmentDetail, RecruitmentPostDetail } from '@/types/student';

interface Props {
    recruitment: RecruitmentDetail;
    post: RecruitmentPostDetail;
    eligibility: { eligible: boolean; checks: EligibilityCheck[] };
    fee: number;
    candidate: { name: string; registrationNo: string; dob: string; gender: string; category: string; mobile: string; email: string };
}

const icons = { pass: CircleCheck, fail: CircleX, info: CircleAlert };
const tones = { pass: 'text-success', fail: 'text-destructive', info: 'text-amber-600' };

export default function Apply({ recruitment: r, post, eligibility, fee, candidate }: Props) {
    const form = useForm({ declaration: false, qualification: false });
    const needsQualification = eligibility.checks.some((c) => c.key === 'qualification');
    const profileMissing = eligibility.checks.some((c) => c.key === 'profile' && c.status === 'fail');

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(`/recruitments/${r.id}/apply/${post.id}`);
    };

    return (
        <div className="grid gap-6 px-4 py-8 sm:px-8 lg:px-16 xl:px-24">
            <Head title={`Apply: ${post.name}`} />

            <div>
                <p className="text-sm text-muted-foreground">{r.advtNo} · <Link href={`/recruitments/${r.id}`} className="text-primary hover:underline">View advertisement</Link></p>
                <h1 className="mt-1 text-2xl font-bold tracking-tight text-primary-deep">Apply for {post.name}</h1>
                <p className="text-sm text-muted-foreground">{r.postName}</p>
            </div>

            <div className="grid items-start gap-6 lg:grid-cols-[1fr_22rem]">
                <div className="grid gap-6">
                    <Panel title="Eligibility check" icon={ShieldCheck}>
                        <ul className="grid gap-3">
                            {eligibility.checks.map((c) => {
                                const Icon = icons[c.status];

                                return (
                                    <li key={c.key} className="flex items-start gap-3 text-sm">
                                        <Icon className={cn('mt-0.5 size-5 shrink-0', tones[c.status])} aria-hidden="true" />
                                        <div>
                                            <p className="font-medium">{c.label}</p>
                                            <p className="text-muted-foreground">{c.message}</p>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                        {profileMissing && (
                            <Button asChild className="mt-4"><Link href="/student/profile">Complete my profile</Link></Button>
                        )}
                    </Panel>

                    {eligibility.eligible && (
                        <Panel title="Declaration" icon={ClipboardCheck}>
                            <form onSubmit={submit} className="grid gap-4">
                                {needsQualification && (
                                    <label className="flex items-start gap-3 text-sm">
                                        <Checkbox checked={form.data.qualification} onCheckedChange={(v) => form.setData('qualification', v === true)} className="mt-0.5" />
                                        <span>I hold the minimum qualification for this post{post.minimumQualification ? ` (${post.minimumQualification})` : ''} and will produce the certificates when asked.</span>
                                    </label>
                                )}
                                {form.errors.qualification && <p role="alert" className="text-sm text-destructive">{form.errors.qualification}</p>}

                                <label className="flex items-start gap-3 text-sm">
                                    <Checkbox checked={form.data.declaration} onCheckedChange={(v) => form.setData('declaration', v === true)} className="mt-0.5" />
                                    <span>I declare that all the information in my profile is true and complete. I understand that my application will be rejected, or my selection cancelled, if any detail is found to be false.</span>
                                </label>
                                {form.errors.declaration && <p role="alert" className="text-sm text-destructive">{form.errors.declaration}</p>}
                                {(form.errors as Record<string, string>).eligibility && <p role="alert" className="text-sm text-destructive">{(form.errors as Record<string, string>).eligibility}</p>}

                                <div className="flex flex-wrap gap-2">
                                    <Button type="submit" disabled={form.processing}>Submit Application</Button>
                                    <Button asChild variant="outline"><Link href={`/recruitments/${r.id}`}>Cancel</Link></Button>
                                </div>
                            </form>
                        </Panel>
                    )}

                    {!eligibility.eligible && !profileMissing && (
                        <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                            You do not meet one or more requirements for this post, so you cannot apply. You can still check the other posts in this advertisement.
                        </p>
                    )}
                </div>

                <aside className="grid gap-6">
                    <Panel title="Applying as" icon={IdCard}>
                        <dl className="grid gap-2 text-sm">
                            {([
                                ['Name', candidate.name],
                                ['Registration no.', candidate.registrationNo],
                                ['Date of birth', formatDate(candidate.dob)],
                                ['Gender', candidate.gender],
                                ['Category', candidate.category],
                                ['Mobile', candidate.mobile],
                                ['Email', candidate.email],
                            ] as const).map(([k, v]) => (
                                <div key={k} className="flex justify-between gap-3 border-b pb-1.5 last:border-0">
                                    <dt className="text-muted-foreground">{k}</dt>
                                    <dd className="break-all text-right font-medium">{v}</dd>
                                </div>
                            ))}
                        </dl>
                        <p className="mt-3 text-xs text-muted-foreground">Name, date of birth and category come from your registration and cannot be changed here.</p>
                    </Panel>

                    <Panel title="Summary" icon={ClipboardCheck}>
                        <dl className="grid gap-2 text-sm">
                            <div className="flex justify-between"><dt className="text-muted-foreground">Post</dt><dd className="font-medium">{post.name}</dd></div>
                            <div className="flex justify-between"><dt className="text-muted-foreground">Last date</dt><dd className="font-medium">{formatDate(r.endDate)}</dd></div>
                            <div className="flex justify-between"><dt className="text-muted-foreground">Application fee</dt><dd className="font-semibold">{fee > 0 ? inr(fee) : 'Nil'}</dd></div>
                        </dl>
                        {fee > 0 && <p className="mt-3 text-xs text-muted-foreground">Online payment is not available yet. The fee will show as pending on your application.</p>}
                    </Panel>
                </aside>
            </div>
        </div>
    );
}

Apply.layout = (page: ReactNode) => <StudentPortalLayout>{page}</StudentPortalLayout>;
