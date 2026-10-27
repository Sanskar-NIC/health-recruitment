import { usePage } from '@inertiajs/react';
import { format, isValid, parseISO } from 'date-fns';
import { Accessibility, Banknote, BadgeCheck, Briefcase, Building, Cake, CalendarDays, CircleHelp, FileText, Fingerprint, Flag, Hash, FolderOpen, GraduationCap, HeartHandshake, Home, IdCard, Landmark, Languages, Mail, Map, MapPin, MapPinned, Mailbox, Percent, Phone, Ruler, Scale, School, Shapes, Signpost, Tags, UserRound, Users, VenusAndMars, Weight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { profileFileUrl } from '@/api/profile.api';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { AddressBlock, FileRef, ProfileDraft } from '@/lib/profile';

type Value = string | boolean | FileRef | null | undefined;

const yesNo = (v: string) => (v === 'yes' ? 'Yes' : v === 'no' ? 'No' : '');

const date = (v: string) => {
    const d = v ? parseISO(v) : null;

    return d && isValid(d) ? format(d, 'dd-MMM-yyyy') : v;
};

const isPdf = (f: FileRef) => /\.pdf$/i.test(f.name) || /\.pdf$/i.test(f.path);

/** Link that opens the uploaded document in a modal instead of a new tab. */
function FileViewer({ file, label }: { file: FileRef; label: string }) {
    const [open, setOpen] = useState(false);
    const url = profileFileUrl(file.path);

    return (
        <>
            <button type="button" onClick={() => setOpen(true)} className="inline-flex items-center gap-1.5 rounded font-medium text-link hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none">
                <FileText className="size-4 shrink-0" aria-hidden="true" />
                <span className="text-left break-all">{file.name}</span>
            </button>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>{label}</DialogTitle>
                        <DialogDescription className="break-all">{file.name}</DialogDescription>
                    </DialogHeader>
                    {isPdf(file) ? (
                        <iframe src={url} title={label} className="h-[70vh] w-full rounded-md border" />
                    ) : (
                        <img src={url} alt={label} className="max-h-[70vh] w-full rounded-md border bg-muted/30 object-contain" />
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}

/** Thumbnail card for the photo / signature; opens the full file in the same modal. */
function ImagePreview({ file, label, className }: { file: FileRef | null; label: string; className: string }) {
    const [open, setOpen] = useState(false);

    return (
        <figure className="grid justify-items-center gap-2">
            {file ? (
                <>
                    <button type="button" onClick={() => setOpen(true)} aria-label={`View ${label}`} className="overflow-hidden rounded-lg border bg-muted/30 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none">
                        <img src={profileFileUrl(file.path)} alt={label} className={className} />
                    </button>
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogContent className="sm:max-w-xl">
                            <DialogHeader>
                                <DialogTitle>{label}</DialogTitle>
                                <DialogDescription className="break-all">{file.name}</DialogDescription>
                            </DialogHeader>
                            <img src={profileFileUrl(file.path)} alt={label} className="max-h-[70vh] w-full rounded-md border bg-muted/30 object-contain" />
                        </DialogContent>
                    </Dialog>
                </>
            ) : (
                <div className={`${className} flex items-center justify-center rounded-lg border border-dashed text-xs text-muted-foreground`}>Not uploaded</div>
            )}
            <figcaption className="text-xs font-medium text-muted-foreground">{label}</figcaption>
        </figure>
    );
}

const tones = {
    teal: 'border-primary bg-primary-tint text-primary',
    sky: 'border-sky-500 bg-sky-50 text-sky-700',
    emerald: 'border-emerald-500 bg-emerald-50 text-emerald-700',
    amber: 'border-amber-500 bg-amber-50 text-amber-700',
    violet: 'border-violet-500 bg-violet-50 text-violet-700',
};

function SubHeading({ children, tone = 'teal' }: { children: ReactNode; tone?: keyof typeof tones }) {
    return <h3 className={`mb-4 rounded-md border-l-4 px-3 py-1.5 text-sm font-semibold ${tones[tone]}`}>{children}</h3>;
}

/** First matching keyword wins, so more specific labels come before generic ones. */
const FIELD_ICONS: [RegExp, LucideIcon][] = [
    [/aadhaar number/i, Fingerprint],
    [/aadhaar/i, IdCard],
    [/birth/i, Cake],
    [/date|issue|from$|^to$/i, CalendarDays],
    [/certificate$|document/i, BadgeCheck],
    [/district/i, Map],
    [/number/i, Hash],
    [/^p\.?o\.?$|pincode/i, Mailbox],
    [/resident/i, MapPin],
    [/father|mother's name/i, Users],
    [/tongue/i, Languages],
    [/mobile/i, Phone],
    [/email/i, Mail],
    [/nationality/i, Flag],
    [/gender/i, VenusAndMars],
    [/marital/i, HeartHandshake],
    [/category/i, Tags],
    [/disab/i, Accessibility],
    [/name/i, UserRound],
    [/house|vill/i, Home],
    [/street|locality|p\.s\./i, Signpost],
    [/state|city/i, Landmark],
    [/bpl/i, Banknote],
    [/employee|employer|sector|designation/i, Briefcase],
    [/serviceman/i, BadgeCheck],
    [/height|chest/i, Ruler],
    [/weight/i, Weight],
    [/qualification|stream/i, GraduationCap],
    [/board|university/i, School],
    [/percentage|cgpa|obtained|out of/i, Percent],
    [/marks|result|year/i, Scale],
    [/status/i, Shapes],
];

const iconFor = (label: string): LucideIcon => FIELD_ICONS.find(([re]) => re.test(label))?.[1] ?? CircleHelp;

function Row({ label, value }: { label: string; value: Value }) {
    const Icon = iconFor(label);

    let content: ReactNode = <span className="text-muted-foreground">—</span>;

    if (value && typeof value === 'object') {
        content = <FileViewer file={value} label={label} />;
    } else if (typeof value === 'boolean') {
        content = value ? 'Yes' : 'No';
    } else if (value) {
        content = value;
    }

    return (
        <div className="min-w-0">
            <dt className="flex items-center gap-1.5 text-xs font-bold text-primary-deep">
                <Icon className="size-3.5 shrink-0 text-primary" aria-hidden="true" />
                {label}
            </dt>
            <dd className="mt-0.5 text-sm font-medium break-words">{content}</dd>
        </div>
    );
}

function Grid({ children }: { children: ReactNode }) {
    return <dl className="grid grid-cols-2 gap-x-4 gap-y-4 sm:gap-x-6 xl:grid-cols-3">{children}</dl>;
}

function Section({ title, icon: Icon, children }: { title: string; icon: LucideIcon; children: ReactNode }) {
    return (
        <section className="overflow-hidden rounded-xl border bg-card shadow-sm">
            <header className="flex items-center gap-2.5 border-b bg-muted/40 px-4 py-2.5">
                <Icon className="size-4.5 text-primary" aria-hidden="true" />
                <h2 className="text-sm font-bold text-primary-deep">{title}</h2>
            </header>
            <div className="p-4 sm:p-5">{children}</div>
        </section>
    );
}

/** A submitted document as a tappable card; opens in the same modal as the inline links. */
function DocCard({ file, label }: { file: FileRef; label: string }) {
    const [open, setOpen] = useState(false);
    const url = profileFileUrl(file.path);
    const pdf = isPdf(file);

    return (
        <>
            <button type="button" onClick={() => setOpen(true)} className="flex w-full items-center gap-3 rounded-xl border bg-card p-3 text-left shadow-sm transition hover:border-primary hover:bg-primary/5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
                <span className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted text-muted-foreground">
                    {pdf ? <FileText className="size-5" aria-hidden="true" /> : <img src={url} alt="" className="size-full object-cover" loading="lazy" />}
                </span>
                <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold">{label}</span>
                    <span className="block truncate text-xs text-muted-foreground">{file.name}</span>
                </span>
                <span className="text-xs font-medium text-link">View</span>
            </button>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-h-[92vh] sm:max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>{label}</DialogTitle>
                        <DialogDescription className="break-all">{file.name}</DialogDescription>
                    </DialogHeader>
                    {pdf ? <iframe src={url} title={label} className="h-[70vh] w-full rounded-md border" /> : <img src={url} alt={label} className="max-h-[70vh] w-full rounded-md border bg-muted/30 object-contain" />}
                </DialogContent>
            </Dialog>
        </>
    );
}

const TABS = [
    { id: 'personal', label: 'Personal', icon: UserRound },
    { id: 'address', label: 'Address', icon: Home },
    { id: 'other', label: 'Other', icon: MapPinned },
    { id: 'qualifications', label: 'Qualifications', icon: GraduationCap },
    { id: 'experience', label: 'Experience', icon: Briefcase },
    { id: 'documents', label: 'Documents', icon: FolderOpen },
] as const;
type TabId = (typeof TABS)[number]['id'];

function Address({ title, block, tone }: { title: string; block: AddressBlock; tone: keyof typeof tones }) {
    return (
        <div>
            <SubHeading tone={tone}>{title}</SubHeading>
            <Grid>
                <Row label="House No./Vill/Town" value={block.house} />
                <Row label="Street Name" value={block.street} />
                <Row label="Locality" value={block.locality} />
                <Row label="P.O." value={block.po} />
                <Row label="P.S." value={block.ps} />
                <Row label="Pincode" value={block.pincode} />
                <Row label="State/UT" value={block.state} />
                <Row label="City" value={block.city} />
                <Row label="District" value={block.district} />
            </Grid>
        </div>
    );
}

/** Read-only summary of every submitted step, shown before the student chooses to edit. */
export function ProfilePreview({ draft }: { draft: ProfileDraft }) {
    const registrationNo = (usePage().props as unknown as { auth?: { student?: { registration_no?: string } | null } }).auth?.student?.registration_no;
    const { personal: p, address: a, other: o, experience: x, qualifications: q, uploads: u } = draft;
    const [tab, setTab] = useState<TabId>('personal');

    const documents = [
        { label: 'Photograph', file: u.photo },
        { label: 'Signature', file: u.signature },
        { label: 'PRTC Certificate', file: p.is_tripura_resident === 'yes' ? p.prtc_certificate : null },
        { label: 'Aadhaar (Front)', file: p.aadhaar_front },
        { label: 'Aadhaar (Back)', file: p.aadhaar_back },
        ...q.map((row, i) => ({ label: `${row.type || `Qualification ${i + 1}`} certificate`, file: row.document })),
        ...(x.has_experience === 'yes' ? x.entries.map((e, i) => ({ label: `${e.employer || `Experience ${i + 1}`} – experience certificate`, file: e.document })) : []),
    ].filter((d): d is { label: string; file: FileRef } => !!d.file);

    return (
        <div className="grid gap-4 sm:gap-5">
            <div className="flex items-center gap-4 rounded-xl border bg-card p-4 shadow-sm sm:gap-6 sm:p-5">
                <ImagePreview file={u.photo} label="Photograph" className="h-28 w-24 object-cover sm:h-32 sm:w-28" />
                <div className="min-w-0 flex-1">
                    <p className="text-lg leading-snug font-semibold break-words text-primary-deep sm:text-2xl">{[p.title, p.name].filter(Boolean).join(' ')}</p>
                    {registrationNo && <p className="mt-1 font-mono text-xs font-semibold text-primary sm:text-sm">Reg. No: {registrationNo}</p>}
                    <div className="mt-2 grid gap-0.5 text-sm text-muted-foreground">
                        {p.mobile && <span>{p.mobile}</span>}
                        {p.email && <span className="break-all">{p.email}</span>}
                    </div>
                </div>
                <div className="hidden sm:block"><ImagePreview file={u.signature} label="Signature" className="h-16 w-40 object-contain" /></div>
            </div>

            <div role="tablist" aria-label="Profile sections" className="grid grid-cols-3 gap-1.5 rounded-xl border bg-card p-1.5 shadow-sm sm:grid-cols-6 sm:gap-1 sm:p-1">
                {TABS.map((t) => (
                    <button key={t.id} role="tab" type="button" aria-selected={tab === t.id} onClick={() => setTab(t.id)}
                        className={cn('flex w-fit flex-col items-center justify-center gap-1 justify-self-center rounded-lg px-3 py-2 sm:w-full sm:justify-self-stretch text-xs font-medium transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none sm:flex-row sm:gap-2 sm:px-3 sm:text-sm',
                            tab === t.id ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted')}>
                        <t.icon className="size-4" aria-hidden="true" /> <span className="truncate">{t.label}</span>
                    </button>
                ))}
            </div>

            {tab === 'personal' && (
            <Section title="Personal Information" icon={UserRound}>
                <Grid>
                    <Row label="Tripura Resident" value={yesNo(p.is_tripura_resident)} />
                    {p.is_tripura_resident === 'yes' && (
                        <>
                            <Row label="PRTC Number" value={p.prtc_number} />
                            <Row label="PRTC District" value={p.prtc_district} />
                            <Row label="PRTC Issue Date" value={date(p.prtc_issue_date)} />
                            <Row label="PRTC Certificate" value={p.prtc_certificate} />
                        </>
                    )}
                    <Row label="Name" value={[p.title, p.name].filter(Boolean).join(' ')} />
                    <Row label="Mobile" value={p.mobile} />
                    <Row label="Email" value={p.email} />
                    <Row label="Father's Name" value={p.father_name} />
                    <Row label="Mother's Name" value={p.mother_name} />
                    <Row label="Nationality" value={p.nationality} />
                    <Row label="Gender" value={p.gender} />
                    <Row label="Mother Tongue" value={p.mother_tongue} />
                    <Row label="Date of Birth" value={date(p.dob)} />
                    <Row label="Marital Status" value={p.marital_status} />
                    <Row label="Aadhaar Number" value={p.aadhaar_no} />
                    <Row label="Name on Aadhaar" value={p.aadhaar_name} />
                    <Row label="Aadhaar (Front)" value={p.aadhaar_front} />
                    <Row label="Aadhaar (Back)" value={p.aadhaar_back} />
                    <Row label="Category" value={p.category} />
                    {p.category && p.category !== 'UR' && (
                        <>
                            <Row label="Certificate Number" value={p.cert_number} />
                            <Row label="Certificate District" value={p.cert_district} />
                            <Row label="Certificate Date" value={date(p.cert_date)} />
                        </>
                    )}
                    <Row label="Person with Benchmark Disability" value={yesNo(p.is_pwd)} />
                    {p.is_pwd === 'yes' && <Row label="Disability Percentage" value={p.ph_percentage} />}
                </Grid>
            </Section>
            )}

            {tab === 'address' && (
            <Section title="Address Details" icon={Home}>
                <div className="grid gap-6">
                    <Address title="Permanent Address" block={a.permanent} tone="sky" />
                    <Address title={a.same_as_permanent ? 'Correspondence Address (same as permanent)' : 'Correspondence Address'} block={a.same_as_permanent ? a.permanent : a.correspondence} tone="emerald" />
                </div>
            </Section>
            )}

            {tab === 'other' && (
            <Section title="Other Details" icon={MapPinned}>
                <Grid>
                    <Row label="BPL Card Holder" value={yesNo(o.is_bpl)} />
                    {o.is_bpl === 'yes' && (
                        <>
                            <Row label="BPL Number" value={o.bpl_number} />
                            <Row label="BPL District" value={o.bpl_district} />
                            <Row label="BPL Issue Date" value={date(o.bpl_date)} />
                        </>
                    )}
                    <Row label="Government Employee" value={yesNo(o.is_govt_employee)} />
                    <Row label="Ex-Serviceman" value={yesNo(o.is_ex_serviceman)} />
                    <Row label="Height (cm)" value={o.height_cm} />
                    <Row label="Chest (cm)" value={o.chest_cm} />
                    <Row label="Weight (kg)" value={o.weight_kg} />
                </Grid>
            </Section>
            )}

            {tab === 'qualifications' && (
            <Section title="Qualification Details" icon={GraduationCap}>
                <div className="grid gap-6">
                    {q.map((row, i) => (
                        <div key={i} className={i > 0 ? 'border-t pt-6' : undefined}>
                            <SubHeading tone="amber">Qualification {i + 1}</SubHeading>
                            <Grid>
                                <Row label="Qualification Type" value={row.type} />
                                <Row label="Branch/Stream" value={row.stream} />
                                <Row label="Result Status" value={row.result_status} />
                                <Row label="Year of Passing" value={row.year} />
                                <Row label="Marks Type" value={row.marks_type} />
                                {row.marks_type !== 'PERCENTAGE' && <Row label="Out Of" value={row.out_of} />}
                                {row.marks_type !== 'PERCENTAGE' && <Row label={row.marks_type === 'CGPA' ? 'CGPA Obtained' : 'Marks Obtained'} value={row.obtained} />}
                                <Row label="Percentage" value={row.percentage} />
                                <Row label="State" value={row.state} />
                                <Row label="Board/University" value={row.board} />
                                <Row label="Document" value={row.document} />
                            </Grid>
                        </div>
                    ))}
                </div>
            </Section>
            )}

            {tab === 'experience' && (
            <Section title="Experience Details" icon={Briefcase}>
                {x.has_experience !== 'yes' || x.entries.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No work experience declared.</p>
                ) : (
                    <div className="grid gap-6">
                        {x.entries.map((e, i) => (
                            <div key={i} className={i > 0 ? 'border-t pt-6' : undefined}>
                                <SubHeading tone="violet">Experience {i + 1}</SubHeading>
                                <Grid>
                                    <Row label="Employer" value={e.employer} />
                                    <Row label="Designation" value={e.designation} />
                                    <Row label="Sector" value={e.sector} />
                                    <Row label="From" value={date(e.from_date)} />
                                    <Row label="To" value={e.currently_working ? 'Currently working' : date(e.to_date)} />
                                    <Row label="Document" value={e.document} />
                                </Grid>
                            </div>
                        ))}
                    </div>
                )}
            </Section>
            )}

            {tab === 'documents' && (
                <Section title={`Submitted documents (${documents.length})`} icon={FolderOpen}>
                    {documents.length === 0 ? <p className="text-sm text-muted-foreground">No documents uploaded.</p> : (
                        <div className="grid gap-3 md:grid-cols-2">
                            {documents.map((d) => <DocCard key={d.label} file={d.file} label={d.label} />)}
                        </div>
                    )}
                </Section>
            )}
        </div>
    );
}
