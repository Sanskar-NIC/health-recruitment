import { Head, Link } from '@inertiajs/react';
import { BadgeIndianRupee, CalendarDays, CheckCircle2, ChevronDown, ClipboardList, Download, FileCheck2, FileText, GraduationCap, Info, MapPin, UserCheck, Users } from 'lucide-react';
import type { ReactNode } from 'react';
import { Panel } from '@/components/student/panel';
import { StatusBadge } from '@/components/student/status-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
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

/** Joins hard-wrapped lines back into paragraphs; a line break only survives after sentence-ending punctuation. */
function toParagraphs(text: string): string[] {
    const out: string[] = [];

    text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean).forEach((line) => {
        const prev = out[out.length - 1];

        if (prev && !/[.:;!?]$/.test(prev)) {
            out[out.length - 1] = `${prev} ${line}`;
        } else {
            out.push(line);
        }
    });

    return out;
}

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

            <div className="border-b bg-primary-tint/60 px-4 py-6 sm:px-8 sm:py-8 lg:px-16 xl:px-24">
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

            <div className="grid items-start gap-6 px-4 py-6 sm:px-8 sm:py-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:px-16 xl:px-24">
                <div className="grid min-w-0 gap-6">
                    <Panel title="Overview" icon={Info}>
                        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                            <Fact label="Total vacancies">{r.vacancies}</Fact>
                            <Fact label="Posts">{r.posts.length}</Fact>
                            <Fact label="Notification date">{r.notificationDate ? formatDate(r.notificationDate) : '–'}</Fact>
                            <Fact label="Reference no.">{r.referenceNo || '–'}</Fact>
                        </dl>
                        {r.description && (
                            <div className="mt-4 grid gap-2 text-sm leading-relaxed text-foreground wrap-break-word">
                                {toParagraphs(r.description).map((line, i) => <p key={i}>{line}</p>)}
                            </div>
                        )}
                        {r.applyMode === 'walk_in' && (
                            <p className="mt-4 flex items-start gap-2.5 rounded-xl border border-violet-200 bg-violet-50 p-4 text-sm font-medium text-violet-900">
                                <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                                This is a walk-in interview. There is no online application. Read the schedule and instructions above and report in person with your original documents.
                            </p>
                        )}
                        {iv && (iv.date || iv.venue || iv.instructions || iv.documentsToCarry) && (
                            <Collapsible defaultOpen className="group/iv mt-4 overflow-hidden rounded-xl border border-violet-200 bg-violet-50/60 text-sm text-violet-950">
                                <CollapsibleTrigger className="flex w-full items-center gap-2 bg-violet-100/70 px-4 py-2.5 text-left font-semibold outline-none focus-visible:ring-2 focus-visible:ring-violet-400 group-data-[state=open]/iv:border-b group-data-[state=open]/iv:border-violet-200">
                                    <UserCheck className="size-4 shrink-0" aria-hidden="true" />
                                    <span>Interview details</span>
                                    {iv.date && (
                                        <span className="ml-1 hidden min-w-0 truncate text-xs font-normal text-violet-700 group-data-[state=open]/iv:hidden sm:inline">
                                            {formatDate(iv.date)}{iv.dateTo && iv.dateTo !== iv.date ? ` – ${formatDate(iv.dateTo)}` : ''}
                                        </span>
                                    )}
                                    <ChevronDown className="ml-auto size-4 shrink-0 transition-transform group-data-[state=open]/iv:rotate-180" aria-hidden="true" />
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                <div className="grid gap-4 p-4">
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        <div className="flex items-start gap-2.5">
                                            <CalendarDays className="mt-0.5 size-4 shrink-0 text-violet-700" aria-hidden="true" />
                                            <div>
                                                <p className="text-xs font-medium text-violet-700">Date &amp; time</p>
                                                <p className="font-medium">
                                                    {iv.date ? formatDate(iv.date) : 'Date to be announced'}
                                                    {iv.dateTo && iv.dateTo !== iv.date ? ` to ${formatDate(iv.dateTo)}` : ''}
                                                    {iv.time ? `, ${formatTime(iv.time)}` : ''}
                                                </p>
                                            </div>
                                        </div>
                                        {iv.venue && (
                                            <div className="flex items-start gap-2.5">
                                                <MapPin className="mt-0.5 size-4 shrink-0 text-violet-700" aria-hidden="true" />
                                                <div className="min-w-0">
                                                    <p className="text-xs font-medium text-violet-700">Venue</p>
                                                    <p className="font-medium wrap-break-word">{iv.venue}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    {iv.documentsToCarry && (
                                        <div className="grid gap-1">
                                            <p className="text-xs font-semibold uppercase tracking-wide text-violet-700">Documents to carry</p>
                                            <p className="leading-relaxed wrap-break-word">{iv.documentsToCarry}</p>
                                        </div>
                                    )}
                                    {iv.instructions && (
                                        <div className="grid gap-1.5">
                                            <p className="text-xs font-semibold uppercase tracking-wide text-violet-700">Instructions</p>
                                            <div className="grid max-w-3xl gap-2 leading-relaxed wrap-break-word">
                                                {toParagraphs(iv.instructions).map((line, i) => <p key={i}>{line}</p>)}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                </CollapsibleContent>
                            </Collapsible>
                        )}
                    </Panel>

                    <Panel title="Posts & Vacancies" icon={Users} bodyClassName="p-0">
                        <ul className="divide-y md:hidden">
                            {r.posts.map((p) => (
                                <li key={p.id} className="grid gap-3 p-4 text-sm">
                                    <div>
                                        <p className="font-semibold">{p.name}</p>
                                        {p.code && <p className="text-xs text-muted-foreground">{p.code}</p>}
                                        <div className="flex flex-wrap gap-1">
                                            {p.isContractual && <Badge variant="secondary" className="mt-1">Contractual{p.contract ? ` · ${p.contract}` : ''}</Badge>}
                                            {p.reservedFor && <Badge variant="outline" className="mt-1">Reserved: {p.reservedFor}</Badge>}
                                        </div>
                                    </div>
                                    <dl className="grid grid-cols-2 gap-3">
                                        <Fact label="Vacancies">{p.vacancies}</Fact>
                                        <Fact label="Monthly salary">{inr(p.monthlySalary)}</Fact>
                                        <Fact label="Max age">{p.ageMax ? `${p.ageMax} yrs` : '–'}</Fact>
                                        <Fact label="Experience">{p.experienceYears ? `${p.experienceYears} yrs` : 'Not required'}</Fact>
                                    </dl>
                                    <div>
                                        <p className="text-xs font-medium text-muted-foreground">Minimum qualification</p>
                                        <p className="mt-0.5 font-medium">{p.minimumQualification || '–'}</p>
                                        {p.preferableQualification && <p className="text-xs text-muted-foreground">Preferable: {p.preferableQualification}</p>}
                                    </div>
                                    {p.experienceYears && p.experienceCriteria ? <p className="text-xs text-muted-foreground">{p.experienceCriteria}</p> : null}
                                </li>
                            ))}
                        </ul>
                        <div className="hidden overflow-x-auto md:block">
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

                <aside className="order-first grid gap-6 lg:order-none lg:sticky lg:top-20">
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
