import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Briefcase, CalendarDays, CheckCircle2, ExternalLink, FileText, GraduationCap, Image as ImageIcon, IndianRupee, Info, Mail, MapPin, Phone, Settings, UserRound, XCircle } from 'lucide-react';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { STATUS_TONE } from '@/components/admin/application/status';
import { fmtDate } from '@/components/admin/recruitment/review';
import { Field as FormField, Textarea } from '@/components/admin/recruitment/ui';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AdminLayout from '@/layouts/admin-layout';
import { cn } from '@/lib/utils';

type Dict = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

interface Doc {
    key: string;
    label: string;
    name: string;
    size: number | null;
    kind: 'pdf' | 'image';
    url: string;
}

interface Props {
    application: {
        id: number;
        applicationNo: string;
        status: 'submitted' | 'withdrawn' | 'rejected';
        rejectionReason: string | null;
        rejectedAt: string | null;
        category: string;
        submittedAt: string | null;
        withdrawnAt: string | null;
        candidateName: string;
        registrationNo: string;
        mobile: string;
        recruitmentId: number;
        advtNo: string;
        title: string;
        postName: string;
        postCode: string | null;
        feeAmount: number;
        feeStatus: 'not_required' | 'pending' | 'paid';
        candidate: { name: string; dob: string | null; gender: string; email: string };
        profile: { personal: Dict; address: Dict; other_details: Dict; experience: Dict; qualifications: Dict[] };
        checks: { key: string; label: string; status: string; message: string }[];
        documents: Doc[];
        photo: string | null;
    };
}

const FEE_LABEL = { not_required: 'No fee', pending: 'Pending', paid: 'Paid' };
const TABS = [
    { id: 'profile', label: 'Profile', icon: UserRound },
    { id: 'education', label: 'Education & experience', icon: GraduationCap },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'checks', label: 'Eligibility checks', icon: CheckCircle2 },
] as const;
type TabId = (typeof TABS)[number]['id'];

const yn = (v: unknown) => (v === 'yes' || v === true ? 'Yes' : v === 'no' || v === false ? 'No' : '');
const kb = (n: number | null) => (n ? (n >= 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`) : '');

function Card({ title, icon: Icon, children, className }: { title: string; icon?: typeof UserRound; children: ReactNode; className?: string }) {
    return (
        <section className={cn('overflow-hidden rounded-xl border bg-card shadow-sm', className)}>
            <h2 className="flex items-center gap-2 border-b bg-muted/40 px-4 py-2.5 text-sm font-semibold text-primary-deep">
                {Icon && <Icon className="size-4" aria-hidden="true" />} {title}
            </h2>
            <div className="p-4">{children}</div>
        </section>
    );
}

function Field({ label, value }: { label: string; value?: ReactNode }) {
    return (
        <div className="min-w-0">
            <dt className="text-xs text-muted-foreground">{label}</dt>
            <dd className="mt-0.5 text-sm font-medium break-words">{value || '—'}</dd>
        </div>
    );
}

const Grid = ({ children }: { children: ReactNode }) => <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2 xl:grid-cols-3">{children}</dl>;

function address(a?: Dict) {
    if (!a) return '';

    const line = [a.house, a.street, a.locality, a.po, a.city, a.district, a.state].filter(Boolean).join(', ');

    return [line, a.ps && `PS: ${a.ps}`, a.pincode && `PIN: ${a.pincode}`].filter(Boolean).join(' · ');
}

function ProfileTab({ p }: { p: Props['application']['profile'] }) {
    const x = p.personal ?? {};
    const o = p.other_details ?? {};

    return (
        <div className="grid gap-5">
            <Card title="Personal details" icon={UserRound}>
                <Grid>
                    <Field label="Father's name" value={x.father_name} />
                    <Field label="Mother's name" value={x.mother_name} />
                    <Field label="Marital status" value={x.marital_status} />
                    <Field label="Nationality" value={x.nationality} />
                    <Field label="Mother tongue" value={x.mother_tongue} />
                    <Field label="Aadhaar no." value={x.aadhaar_no} />
                    <Field label="Name on Aadhaar" value={x.aadhaar_name} />
                    <Field label="Category" value={x.category} />
                    <Field label="Category certificate" value={x.cert_number && `${x.cert_number}, ${x.cert_district ?? ''} (${fmtDate(x.cert_date)})`} />
                    <Field label="Tripura resident" value={yn(x.is_tripura_resident)} />
                    <Field label="PRTC" value={x.prtc_number && `${x.prtc_number}, ${x.prtc_district ?? ''} (${fmtDate(x.prtc_issue_date)})`} />
                    <Field label="Person with disability" value={yn(x.is_pwd) && `${yn(x.is_pwd)}${x.ph_percentage ? ` (${x.ph_percentage}%)` : ''}`} />
                    <Field label="BPL" value={yn(o.is_bpl) && `${yn(o.is_bpl)}${o.bpl_number ? ` — ${o.bpl_number}` : ''}`} />
                    <Field label="Government employee" value={yn(o.is_govt_employee)} />
                    <Field label="Ex-serviceman" value={yn(o.is_ex_serviceman)} />
                </Grid>
            </Card>

            <Card title="Address" icon={MapPin}>
                <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Permanent address" value={address(p.address?.permanent)} />
                    <Field label="Correspondence address" value={address(p.address?.correspondence)} />
                </div>
            </Card>
        </div>
    );
}

function EducationTab({ p }: { p: Props['application']['profile'] }) {
    const quals = p.qualifications ?? [];
    const exp = p.experience?.has_experience === 'yes' ? (p.experience.entries ?? []) : [];

    return (
        <div className="grid gap-5">
            <Card title="Educational qualifications" icon={GraduationCap}>
                {quals.length === 0 ? <p className="text-sm text-muted-foreground">None recorded.</p> : (
                    <div className="grid gap-3">
                        {quals.map((q, i) => (
                            <div key={i} className="rounded-lg border p-3">
                                <div className="flex flex-wrap items-baseline justify-between gap-2">
                                    <p className="font-semibold">{q.type}{q.stream ? ` · ${q.stream}` : ''}</p>
                                    <p className="text-sm font-medium text-primary-deep">{q.percentage != null ? `${q.percentage}%` : ''}{q.out_of ? ` (${q.obtained}/${q.out_of})` : ''}</p>
                                </div>
                                <p className="text-sm text-muted-foreground">{[q.board, q.state].filter(Boolean).join(', ')} · {q.year} · {q.result_status}</p>
                            </div>
                        ))}
                    </div>
                )}
            </Card>

            <Card title="Work experience" icon={Briefcase}>
                {exp.length === 0 ? <p className="text-sm text-muted-foreground">No experience declared.</p> : (
                    <div className="grid gap-3">
                        {exp.map((e: Dict, i: number) => (
                            <div key={i} className="rounded-lg border p-3">
                                <p className="font-semibold">{e.designation} <span className="font-normal text-muted-foreground">at</span> {e.employer}</p>
                                <p className="text-sm text-muted-foreground">{e.sector} · {fmtDate(e.from_date)} → {e.currently_working ? 'Present' : fmtDate(e.to_date)}</p>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    );
}

function DocumentsTab({ docs, onOpen }: { docs: Doc[]; onOpen: (d: Doc) => void }) {
    if (docs.length === 0) return <Card title="Documents" icon={FileText}><p className="text-sm text-muted-foreground">No documents were uploaded.</p></Card>;

    return (
        <div className="grid gap-3 sm:grid-cols-2">
            {docs.map((d) => (
                <button key={d.key} type="button" onClick={() => onOpen(d)} className="flex items-center gap-3 rounded-xl border bg-card p-3 text-left shadow-sm transition hover:border-primary hover:bg-primary/5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
                    <span className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted text-muted-foreground">
                        {d.kind === 'image' ? <img src={d.url} alt="" className="size-full object-cover" loading="lazy" /> : <FileText className="size-5" aria-hidden="true" />}
                    </span>
                    <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold">{d.label}</span>
                        <span className="block truncate text-xs text-muted-foreground">{d.name}{d.size ? ` · ${kb(d.size)}` : ''}</span>
                    </span>
                    <span className="text-xs font-medium text-link">View</span>
                </button>
            ))}
        </div>
    );
}

function ChecksTab({ checks }: { checks: Props['application']['checks'] }) {
    if (checks.length === 0) return <Card title="Eligibility checks" icon={CheckCircle2}><p className="text-sm text-muted-foreground">No checks were recorded for this application.</p></Card>;

    return (
        <Card title="Eligibility checks at submission" icon={CheckCircle2}>
            <ul className="grid gap-3">
                {checks.map((c) => {
                    const pass = c.status === 'pass';
                    const Icon = pass ? CheckCircle2 : c.status === 'info' ? Info : XCircle;

                    return (
                        <li key={c.key} className="flex items-start gap-3 text-sm">
                            <Icon className={cn('mt-0.5 size-5 shrink-0', pass ? 'text-success' : c.status === 'info' ? 'text-primary' : 'text-destructive')} aria-hidden="true" />
                            <div>
                                <p className="font-semibold">{c.label}</p>
                                <p className="text-muted-foreground">{c.message}</p>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </Card>
    );
}

export default function ApplicationShow({ application: a }: Props) {
    const [tab, setTab] = useState<TabId>('profile');
    const [doc, setDoc] = useState<Doc | null>(null);
    const [rejecting, setRejecting] = useState(false);
    const [reason, setReason] = useState('');
    const [error, setError] = useState<string>();
    const [busy, setBusy] = useState(false);

    const closeReject = () => {
        setRejecting(false);
        setReason('');
        setError(undefined);
    };

    const reject = () => {
        setBusy(true);
        router.post(`/admin/applications/${a.id}/reject`, { reason }, {
            preserveScroll: true,
            onSuccess: closeReject,
            onError: (e) => setError(e.reason),
            onFinish: () => setBusy(false),
        });
    };

    const openDocs = () => {
        setTab('documents');
        document.getElementById('application-tabs')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    return (
        <div className="mx-auto grid w-full max-w-6xl gap-5">
            <Head title={`Application ${a.applicationNo} – Admin`} />

            <div className="flex flex-wrap items-center justify-between gap-3">
                <Link href="/admin/applications" className="flex w-fit items-center gap-1 text-sm text-link hover:underline"><ArrowLeft className="size-4" aria-hidden="true" /> All applications</Link>
                {a.status === 'submitted' && (
                    <Button onClick={() => setRejecting(true)} className="bg-red-600 text-white hover:bg-red-700"><Settings /> Reject application</Button>
                )}
            </div>

            {a.status === 'rejected' && (
                <div role="alert" className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm">
                    <XCircle className="mt-0.5 size-5 shrink-0 text-destructive" aria-hidden="true" />
                    <div>
                        <p className="font-semibold text-destructive">Application rejected{a.rejectedAt ? ` on ${fmtDate(a.rejectedAt)}` : ''}</p>
                        <p className="text-muted-foreground">{a.rejectionReason}</p>
                    </div>
                </div>
            )}

            <header className="flex flex-col gap-5 rounded-xl border bg-card p-5 shadow-sm sm:flex-row sm:items-center">
                <button type="button" onClick={() => a.photo && setDoc(a.documents.find((d) => d.key === 'photo') ?? null)} disabled={!a.photo} className="size-24 shrink-0 overflow-hidden rounded-xl border bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none" aria-label="View photograph">
                    {a.photo ? <img src={a.photo} alt={a.candidateName} className="size-full object-cover" /> : <UserRound className="m-auto size-10 text-muted-foreground" aria-hidden="true" />}
                </button>

                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <h1 className="text-2xl font-semibold text-primary-deep">{a.candidateName}</h1>
                        <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium capitalize', STATUS_TONE[a.status])}>{a.status}</span>
                        <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium">{a.category}</span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">Reg. <span className="font-mono">{a.registrationNo}</span> · Application <span className="font-mono font-semibold text-foreground">{a.applicationNo}</span></p>
                    <p className="mt-0.5 text-sm text-muted-foreground">Applied for <span className="font-medium text-foreground">{a.postName}</span> · {fmtDate(a.submittedAt)}</p>
                </div>

                <Button onClick={openDocs} className="hover:bg-primary-hover"><FileText /> View documents ({a.documents.length})</Button>
            </header>

            <div className="grid items-start gap-5 lg:grid-cols-[20rem_1fr]">
                <aside className="grid gap-5">
                    <Card title="Application" icon={CalendarDays}>
                        <dl className="grid gap-3">
                            <Field label="Advertisement" value={<Link href={`/admin/recruitments/${a.recruitmentId}`} className="text-link hover:underline">{a.advtNo}</Link>} />
                            <Field label="Title" value={a.title} />
                            <Field label="Post" value={`${a.postName}${a.postCode ? ` (${a.postCode})` : ''}`} />
                            <Field label="Applied on" value={fmtDate(a.submittedAt)} />
                            {a.withdrawnAt && <Field label="Withdrawn on" value={fmtDate(a.withdrawnAt)} />}
                            <Field label="Application fee" value={<span className="inline-flex items-center gap-1"><IndianRupee className="size-3.5" aria-hidden="true" />{a.feeAmount > 0 ? `${a.feeAmount} · ${FEE_LABEL[a.feeStatus]}` : FEE_LABEL.not_required}</span>} />
                        </dl>
                    </Card>

                    <Card title="Contact" icon={Phone}>
                        <dl className="grid gap-3">
                            <Field label="Mobile" value={<a href={`tel:${a.mobile}`} className="inline-flex items-center gap-1.5 hover:underline"><Phone className="size-3.5" aria-hidden="true" />{a.mobile}</a>} />
                            <Field label="Email" value={<a href={`mailto:${a.candidate.email}`} className="inline-flex items-center gap-1.5 hover:underline"><Mail className="size-3.5" aria-hidden="true" />{a.candidate.email}</a>} />
                            <Field label="Date of birth" value={fmtDate(a.candidate.dob)} />
                            <Field label="Gender" value={a.candidate.gender} />
                        </dl>
                    </Card>
                </aside>

                <div id="application-tabs" className="grid min-w-0 scroll-mt-4 gap-5">
                    <div role="tablist" className="flex flex-wrap gap-1 rounded-xl border bg-card p-1 shadow-sm">
                        {TABS.map((t) => (
                            <button key={t.id} role="tab" type="button" aria-selected={tab === t.id} onClick={() => setTab(t.id)}
                                className={cn('flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                                    tab === t.id ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted')}>
                                <t.icon className="size-4" aria-hidden="true" /> {t.label}
                                {t.id === 'documents' && <span className={cn('rounded-full px-1.5 text-xs', tab === t.id ? 'bg-white/20' : 'bg-muted')}>{a.documents.length}</span>}
                            </button>
                        ))}
                    </div>

                    {tab === 'profile' && <ProfileTab p={a.profile} />}
                    {tab === 'education' && <EducationTab p={a.profile} />}
                    {tab === 'documents' && <DocumentsTab docs={a.documents} onOpen={setDoc} />}
                    {tab === 'checks' && <ChecksTab checks={a.checks} />}
                </div>
            </div>

            <Dialog open={rejecting} onOpenChange={(o) => !o && closeReject()}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject application · {a.applicationNo}</DialogTitle>
                        <DialogDescription>
                            {a.candidateName} will no longer be considered for {a.postName}. The reason is shown to the candidate, and they cannot re-apply for this post.
                        </DialogDescription>
                    </DialogHeader>
                    <FormField label="Reason for rejection" required error={error}>
                        <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Qualification certificate does not match the minimum requirement." />
                    </FormField>
                    <DialogFooter>
                        <Button variant="outline" onClick={closeReject}>Cancel</Button>
                        <Button disabled={busy} onClick={reject} className="bg-red-600 text-white hover:bg-red-700">Reject application</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={!!doc} onOpenChange={(o) => !o && setDoc(null)}>
                <DialogContent className="flex max-h-[92vh] flex-col gap-3 sm:max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>{doc?.label}</DialogTitle>
                        <DialogDescription>{a.candidateName} · {doc?.name}{doc?.size ? ` · ${kb(doc.size)}` : ''}</DialogDescription>
                    </DialogHeader>
                    {doc && (
                        <div className="min-h-0 flex-1 overflow-auto rounded-lg border bg-muted/40">
                            {doc.kind === 'pdf'
                                ? <iframe src={doc.url} title={doc.label} className="h-[68vh] w-full" />
                                : <img src={doc.url} alt={doc.label} className="mx-auto max-h-[68vh] object-contain" />}
                        </div>
                    )}
                    <div className="flex justify-between gap-2">
                        {doc && a.documents.length > 1 ? (
                            <div className="flex gap-2">
                                {(() => {
                                    const i = a.documents.findIndex((d) => d.key === doc.key);

                                    return (
                                        <>
                                            <Button variant="outline" size="sm" disabled={i <= 0} onClick={() => setDoc(a.documents[i - 1])}>Previous</Button>
                                            <Button variant="outline" size="sm" disabled={i >= a.documents.length - 1} onClick={() => setDoc(a.documents[i + 1])}>Next</Button>
                                        </>
                                    );
                                })()}
                            </div>
                        ) : <span />}
                        {doc && <Button asChild variant="outline" size="sm"><a href={doc.url} target="_blank" rel="noreferrer">{doc.kind === 'pdf' ? <FileText /> : <ImageIcon />} Open in new tab <ExternalLink /></a></Button>}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

ApplicationShow.layout = (page: ReactNode) => <AdminLayout>{page}</AdminLayout>;
