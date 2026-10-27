import { Head, Link } from '@inertiajs/react';
import { BadgeIndianRupee, CalendarDays, CheckCircle2, ClipboardList, Download, FileCheck2, FileText, GraduationCap, Info, MapPin, UserCheck, Users } from 'lucide-react';
import type { ReactNode } from 'react';
import { Panel } from '@/components/student/panel';
import { StatusBadge } from '@/components/student/status-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import StudentAdaptiveLayout from '@/layouts/student-adaptive-layout';
import { formatDate } from '@/lib/portal';
import { formatTime, inr } from '@/lib/recruitment';
import type { RecruitmentDetail, RecruitmentPostDetail } from '@/types/student';

interface Props {
    recruitment: RecruitmentDetail;
    applied: Record<string, number>;
    profileComplete: boolean | null;
}

const GENERAL_INSTRUCTIONS = [
    'Read the complete advertisement carefully before applying.',
    'Complete your profile (personal, address, qualification, photo and signature) before you apply.',
    'Apply only for posts whose eligibility you fully meet. Applications that do not meet the criteria are rejected at scrutiny.',
    'Keep scanned copies of the required documents ready. Originals are verified at the time of selection.',
    'The application fee, once paid, is not refundable.',
    'Use a valid mobile number and email. All communication is sent there and on this portal.',
    'Only one application can be made per post.',
];

function Fact({ label, children }: { label: string; children: ReactNode }) {
    return (
        <div>
            <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
            <dd className="mt-0.5 text-sm font-medium">{children}</dd>
        </div>
    );
}

function ApplyAction({ r, post, applied, profileComplete }: { r: RecruitmentDetail; post: RecruitmentPostDetail; applied?: number; profileComplete: boolean | null }) {
    const isOpen = r.status === 'open' || r.status === 'closing_soon';

    if (applied) {
        return (
            <Button asChild variant="outline" className="w-full border-success/40 text-success hover:bg-success/10">
                <Link href={`/student/applications/${applied}`}><CheckCircle2 className="size-4" aria-hidden="true" /> Applied · View</Link>
            </Button>
        );
    }

    if (r.applyMode === 'walk_in') {
        return <p className="text-center text-xs text-muted-foreground">Walk-in. No application needed.</p>;
    }

    if (!isOpen) {
        return <Button disabled className="w-full">{r.status === 'upcoming' ? 'Opens ' + formatDate(r.startDate) : 'Applications closed'}</Button>;
    }

    if (profileComplete === false) {
        return (
            <Button asChild variant="secondary" className="w-full">
                <Link href="/student/profile">Complete profile to apply</Link>
            </Button>
        );
    }

    return (
        <Button asChild className="w-full hover:bg-primary-hover">
            <Link href={`/recruitments/${r.id}/apply/${post.id}`}>{profileComplete === null ? 'Login to Apply' : 'Apply Now'}</Link>
        </Button>
    );
}

export default function RecruitmentShow({ recruitment: r, applied, profileComplete }: Props) {
    const e = r.eligibility;
    const iv = r.interview;
    const relaxations = Object.entries(e.relaxations);
    const fees = Object.entries(r.fees);
    const hasPhoto = r.documents.photo?.max_kb || r.documents.signature?.max_kb;

    return (
        <>
            <Head title={`${r.postName} (${r.advtNo})`} />

            <div className="border-b bg-primary-tint/60 px-4 py-8 sm:px-8 lg:px-16 xl:px-24">
                <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="font-mono">{r.advtNo}</Badge>
                    <StatusBadge status={r.status} />
                    {r.selectionMode === 'interview' && <Badge variant="secondary">{r.applyMode === 'walk_in' ? 'Walk-in interview' : 'Interview'}</Badge>}
                </div>
                <h1 className="mt-3 text-2xl font-bold tracking-tight text-primary-deep sm:text-3xl">{r.postName}</h1>
                <p className="text-muted-foreground">{r.department}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                    <Button asChild variant="outline" size="sm" className="border-primary/40 text-primary">
                        <a href={r.pdfUrl} target="_blank" rel="noreferrer"><Download className="size-4" aria-hidden="true" /> Advertisement (PDF)</a>
                    </Button>
                    {r.syllabusUrl && (
                        <Button asChild variant="outline" size="sm" className="border-primary/40 text-primary">
                            <a href={r.syllabusUrl} target="_blank" rel="noreferrer"><FileText className="size-4" aria-hidden="true" /> Syllabus (PDF)</a>
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid items-start gap-6 px-4 py-8 sm:px-8 lg:grid-cols-[1fr_22rem] lg:px-16 xl:px-24">
                <div className="grid gap-6">
                    <Panel title="Overview" icon={Info}>
                        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                            <Fact label="Total vacancies">{r.vacancies}</Fact>
                            <Fact label="Posts">{r.posts.length}</Fact>
                            <Fact label="Notification date">{r.notificationDate ? formatDate(r.notificationDate) : '–'}</Fact>
                            <Fact label="Reference no.">{r.referenceNo || '–'}</Fact>
                        </dl>
                        {r.description && <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-foreground">{r.description}</p>}
                        {r.applyMode === 'walk_in' && (
                            <p className="mt-4 rounded-xl bg-violet-50 p-4 text-sm font-medium text-violet-900">
                                This is a walk-in interview. There is no online application. Read the schedule and instructions above and report in person with your original documents.
                            </p>
                        )}
                        {iv && (iv.date || iv.venue || iv.instructions || iv.documentsToCarry) && (
                            <div className="mt-4 grid gap-2 rounded-xl bg-violet-50 p-4 text-sm text-violet-900">
                                <p className="flex items-center gap-2 font-semibold"><UserCheck className="size-4" aria-hidden="true" /> Interview details</p>
                                <p>
                                    {iv.date ? formatDate(iv.date) : 'Date to be announced'}
                                    {iv.dateTo && iv.dateTo !== iv.date ? ` to ${formatDate(iv.dateTo)}` : ''}
                                    {iv.time ? `, ${formatTime(iv.time)}` : ''}
                                </p>
                                {iv.venue && <p className="flex items-center gap-2"><MapPin className="size-4" aria-hidden="true" /> {iv.venue}</p>}
                                {iv.documentsToCarry && <p><strong>Documents to carry:</strong> {iv.documentsToCarry}</p>}
                                {iv.instructions && <p className="whitespace-pre-line"><strong>Instructions:</strong> {iv.instructions}</p>}
                            </div>
                        )}
                    </Panel>

                    <Panel title="Posts & Vacancies" icon={Users} bodyClassName="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-176 text-left text-sm">
                                <thead className="bg-muted/60 text-xs uppercase text-muted-foreground">
                                    <tr>
                                        <th className="px-4 py-3">Post</th>
                                        <th className="px-4 py-3">Vacancies</th>
                                        <th className="px-4 py-3">Monthly salary</th>
                                        <th className="px-4 py-3">Minimum qualification</th>
                                        <th className="px-4 py-3">Max age</th>
                                        <th className="px-4 py-3">Experience</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {r.posts.map((p) => (
                                        <tr key={p.id} className="align-top">
                                            <td className="px-4 py-3">
                                                <p className="font-medium">{p.name}</p>
                                                {p.code && <p className="text-xs text-muted-foreground">{p.code}</p>}
                                                {p.isContractual && <Badge variant="secondary" className="mt-1">Contractual{p.contract ? ` · ${p.contract}` : ''}</Badge>}
                                                {p.reservedFor && <Badge variant="outline" className="mt-1 ml-1">Reserved: {p.reservedFor}</Badge>}
                                            </td>
                                            <td className="px-4 py-3">
                                                <p className="font-medium">{p.vacancies}</p>
                                                {Object.values(p.categoryBreakup).some((n) => n > 0) && (
                                                    <p className="text-xs text-muted-foreground">
                                                        {Object.entries(p.categoryBreakup).filter(([, n]) => n > 0).map(([c, n]) => {
                                                            const w = Number(p.womenBreakup?.[c]) || 0;

                                                            return w > 0 ? `${c} ${n} (${n - w} open + ${w} women)` : `${c} ${n}`;
                                                        }).join(' · ')}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">{inr(p.monthlySalary)}</td>
                                            <td className="px-4 py-3">
                                                {p.minimumQualification || '–'}
                                                {p.preferableQualification && <p className="text-xs text-muted-foreground">Preferable: {p.preferableQualification}</p>}
                                            </td>
                                            <td className="px-4 py-3">{p.ageMax ? `${p.ageMax} yrs` : '–'}</td>
                                            <td className="px-4 py-3">
                                                {p.experienceYears ? `${p.experienceYears} yrs` : 'Not required'}
                                                {p.experienceYears && p.experienceCriteria ? <p className="text-xs text-muted-foreground">{p.experienceCriteria}</p> : null}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Panel>

                    <Panel title="Eligibility" icon={GraduationCap}>
                        <ul className="grid gap-2 text-sm">
                            {(e.ageMin || e.ageMax) && (
                                <li>
                                    <strong>Age:</strong> {e.ageMin ?? 18}–{e.ageMax ?? 'no upper limit'} years
                                    {e.ageCutoff ? ` as on ${formatDate(e.ageCutoff)}` : ''}.
                                    {relaxations.length > 0 && <> Relaxation: {relaxations.map(([k, v]) => `${k} ${v} yrs`).join(', ')}.</>}
                                </li>
                            )}
                            {e.qualifications.length > 0 && (
                                <li>
                                    <strong>Qualification:</strong>{' '}
                                    {e.qualifications.map((q) => (q.min_percent ? `${q.name} (min ${q.min_percent}%)` : q.name)).join(' / ')}
                                </li>
                            )}
                            {e.council && <li><strong>Registration:</strong> Valid registration with {e.council}.</li>}
                            {e.minExperienceYears ? <li><strong>Experience:</strong> At least {e.minExperienceYears} years.</li> : null}
                            {e.prtcRequired && <li><strong>Domicile:</strong> Permanent Resident Certificate (PRTC) of Tripura is required.</li>}
                            {e.gender !== 'any' && <li><strong>Gender:</strong> {e.gender === 'female' ? 'Female' : 'Male'} candidates only.</li>}
                        </ul>
                    </Panel>

                    <div className="grid gap-6 md:grid-cols-2">
                        <Panel title="Application Fee" icon={BadgeIndianRupee}>
                            {fees.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No application fee.</p>
                            ) : (
                                <dl className="grid gap-2 text-sm">
                                    {fees.map(([cat, amount]) => (
                                        <div key={cat} className="flex justify-between border-b pb-1.5 last:border-0">
                                            <dt className="text-muted-foreground">{cat}</dt>
                                            <dd className="font-medium">{Number(amount) === 0 ? 'Exempted' : inr(Number(amount))}</dd>
                                        </div>
                                    ))}
                                </dl>
                            )}
                        </Panel>

                        <Panel title="Documents Required" icon={FileCheck2}>
                            <ul className="grid list-disc gap-1 pl-5 text-sm">
                                <li>Passport-size photograph{r.documents.photo?.max_kb ? ` (${r.documents.photo.min_kb ?? 0}–${r.documents.photo.max_kb} KB)` : ''}</li>
                                <li>Signature{r.documents.signature?.max_kb ? ` (${r.documents.signature.min_kb ?? 0}–${r.documents.signature.max_kb} KB)` : ''}</li>
                                {r.documents.required.map((d) => <li key={d}>{d}</li>)}
                            </ul>
                            {!hasPhoto && r.documents.required.length === 0 && <p className="text-sm text-muted-foreground">As per the advertisement.</p>}
                        </Panel>
                    </div>

                    <Panel title="Instructions" icon={ClipboardList}>
                        <ol className="grid list-decimal gap-1.5 pl-5 text-sm leading-relaxed">
                            {GENERAL_INSTRUCTIONS.map((i) => <li key={i}>{i}</li>)}
                        </ol>
                    </Panel>
                </div>

                <aside className="grid gap-6 lg:sticky lg:top-20">
                    <Panel title="Apply" icon={UserCheck}>
                        {r.applyMode !== 'walk_in' && (
                            <p className="mb-4 text-xs text-muted-foreground">
                                {formatDate(r.startDate)} to {formatDate(r.endDate)}
                            </p>
                        )}
                        <ul className="grid gap-4">
                            {r.posts.map((p) => (
                                <li key={p.id} className="grid gap-2 rounded-xl border p-3">
                                    <div>
                                        <p className="text-sm font-semibold">{p.name}</p>
                                        <p className="text-xs text-muted-foreground">{p.vacancies} vacancies · {inr(p.monthlySalary)}</p>
                                    </div>
                                    <ApplyAction r={r} post={p} applied={applied[p.id]} profileComplete={profileComplete} />
                                </li>
                            ))}
                        </ul>
                    </Panel>

                    <Panel title="Important Dates" icon={CalendarDays}>
                        <ul className="grid gap-2 text-sm">
                            {r.dates.map((d) => (
                                <li key={d.label} className="flex justify-between gap-3 border-b pb-1.5 last:border-0">
                                    <span className="text-muted-foreground">{d.label}</span>
                                    <span className="font-medium">{formatDate(d.date)}</span>
                                </li>
                            ))}
                        </ul>
                    </Panel>
                </aside>
            </div>
        </>
    );
}

RecruitmentShow.layout = (page: ReactNode) => <StudentAdaptiveLayout>{page}</StudentAdaptiveLayout>;
