import { usePage } from '@inertiajs/react';
import { format, isValid, parseISO } from 'date-fns';
import { Briefcase, FileText, GraduationCap, Home, Image as ImageIcon, MapPinned, UserRound } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { profileFileUrl } from '@/api/profile.api';
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
                <span className="break-all text-left">{file.name}</span>
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

function Row({ label, value }: { label: string; value: Value }) {
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
            <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
            <dd className="mt-0.5 text-sm font-medium break-words">{content}</dd>
        </div>
    );
}

function Grid({ children }: { children: ReactNode }) {
    return <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2 xl:grid-cols-3">{children}</dl>;
}

function Section({ title, icon: Icon, children }: { title: string; icon: LucideIcon; children: ReactNode }) {
    return (
        <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
            <header className="flex items-center gap-3 border-b bg-primary-tint/40 px-5 py-3">
                <span className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Icon className="size-4.5" aria-hidden="true" />
                </span>
                <h2 className="text-base font-semibold text-primary-deep">{title}</h2>
            </header>
            <div className="p-5">{children}</div>
        </section>
    );
}

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

    return (
        <div className="grid gap-6">
            <div className="flex flex-wrap items-center justify-between gap-6 rounded-2xl border bg-card p-5 shadow-sm">
                <ImagePreview file={u.photo} label="Photograph" className="h-32 w-28 object-cover" />
                <div className="order-last min-w-0 basis-full text-center sm:order-none sm:flex-1 sm:basis-0">
                    <p className="text-xl font-bold text-primary-deep">{[p.title, p.name].filter(Boolean).join(' ')}</p>
                    <p className="mt-1 font-mono text-sm font-semibold text-primary">{registrationNo ? `Reg. No: ${registrationNo}` : null}</p>
                </div>
                <ImagePreview file={u.signature} label="Signature" className="h-16 w-40 object-contain" />
            </div>

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

            <Section title="Address Details" icon={Home}>
                <div className="grid gap-6">
                    <Address title="Permanent Address" block={a.permanent} tone="sky" />
                    <Address title={a.same_as_permanent ? 'Correspondence Address (same as permanent)' : 'Correspondence Address'} block={a.same_as_permanent ? a.permanent : a.correspondence} tone="emerald" />
                </div>
            </Section>

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

            <Section title="Photo & Signature" icon={ImageIcon}>
                <Grid>
                    <Row label="Photograph" value={u.photo} />
                    <Row label="Signature" value={u.signature} />
                </Grid>
            </Section>
        </div>
    );
}
