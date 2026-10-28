import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, CircleAlert, Loader2, Save, Send, CalendarClock } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { toast } from 'sonner';
import { EligibilityStep } from '@/components/admin/recruitment/step-eligibility';
import { VacancyStep } from '@/components/admin/recruitment/step-vacancy';
import { BasicInfoStep, PostsStep } from '@/components/admin/recruitment/steps-basic';
import { RecruitmentStepSidebar } from '@/components/admin/recruitment/step-sidebar';
import { AttachmentsStep, DatesStep, DocumentsStep, FeeStep } from '@/components/admin/recruitment/steps-misc';
import { RecruitmentReview } from '@/components/admin/recruitment/review';
import { STATUS_LABEL, STATUS_TONE, STEPS, emptyForm, furthestStep, hydrate, stepForError } from '@/components/admin/recruitment/types';
import type { Options, RecruitmentForm, RecruitmentRecord } from '@/components/admin/recruitment/types';
import { Field } from '@/components/admin/recruitment/ui';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AdminLayout from '@/layouts/admin-layout';
import { cn } from '@/lib/utils';

interface Props {
    recruitment: RecruitmentRecord | null;
    options: Options;
}

export default function RecruitmentFormPage({ recruitment, options }: Props) {
    const errors = (usePage().props.errors ?? {}) as Record<string, string>;
    const locked = Boolean(recruitment?.locked);
    const isEdit = recruitment !== null;

    const [form, setForm] = useState<RecruitmentForm>(() => (recruitment ? hydrate(recruitment, options) : emptyForm(options)));
    const [step, setStep] = useState(0);
    const [advertisement, setAdvertisement] = useState<File | null>(null);
    const [publishAt, setPublishAt] = useState(recruitment?.publish_at ?? '');
    const [processing, setProcessing] = useState(false);
    const [visited, setVisited] = useState<Set<number>>(() => new Set([0]));

    const update = (mutate: (draft: RecruitmentForm) => void) =>
        setForm((prev) => {
            const next = structuredClone(prev);
            mutate(next);

            return next;
        });

    const stepsWithErrors = useMemo(() => new Set(Object.keys(errors).map(stepForError)), [errors]);

    // Locked recruitments are already complete, so every step stays open; otherwise later steps unlock as the form is filled in.
    const furthest = locked ? STEPS.length - 1 : furthestStep(form, Boolean(advertisement || recruitment?.advertisement_url));

    const submit = (action: 'draft' | 'schedule' | 'publish' | 'save') => {
        setProcessing(true);

        router.post(
            isEdit ? `/admin/recruitments/${recruitment.id}` : '/admin/recruitments',
            {
                // Structured data travels as one JSON string; blanks become null.
                payload: JSON.stringify({ ...form, action: action === 'save' ? 'draft' : action, publish_at: publishAt || null }, (_k, v) => (v === '' ? null : v)),
                advertisement_pdf: advertisement,
            },
            {
                forceFormData: true,
                preserveScroll: true,
                onError: (errs) => {
                    const first = Math.min(...Object.keys(errs).map(stepForError));

                    setStep(first);
                    setVisited((v) => new Set(v).add(first));
                    toast.error(`Please fix the highlighted fields (${STEPS[first]}).`);
                },
                onFinish: () => setProcessing(false),
            },
        );
    };

    const stepProps = { form, update, errors, options };
    const last = step === STEPS.length - 1;
    const goTo = (n: number | ((s: number) => number)) =>
        setStep((s) => {
            const next = Math.min(typeof n === 'function' ? n(s) : n, furthest);

            setVisited((v) => new Set(v).add(s).add(next));

            return next;
        });
    const stepBody: ReactNode = [
        <BasicInfoStep key="s0" {...stepProps} descriptionOnly={locked} />,
        <PostsStep key="s1" {...stepProps} />,
        <VacancyStep key="s2" {...stepProps} />,
        <EligibilityStep key="s3" {...stepProps} />,
        <FeeStep key="s4" {...stepProps} />,
        <DocumentsStep key="s5" {...stepProps} />,
        <DatesStep key="s6" {...stepProps} />,
        <AttachmentsStep key="s7" advertisement={advertisement} onAdvertisement={setAdvertisement} existing={{ advertisement: recruitment?.advertisement_url ?? null }} errors={errors} />,
        <div key="s8" className="grid gap-5">
            <RecruitmentReview form={form} options={options} advertisementUrl={recruitment?.advertisement_url} pendingFiles={{ advertisement: advertisement?.name }} />
            {!locked && (
                <section className="rounded-lg border bg-card p-5 shadow-sm">
                    <h3 className="mb-3 font-semibold text-primary-deep">Publish</h3>
                    {(errors.publish_at || errors.advertisement_pdf) && (
                        <p role="alert" className="mb-3 flex items-center gap-2 text-sm font-medium text-destructive"><CircleAlert className="size-4" />{errors.publish_at ?? errors.advertisement_pdf}</p>
                    )}
                    <div className="flex flex-wrap items-end gap-4">
                        <Field label="Schedule publish (date & time)" className="w-64">
                            <Input type="datetime-local" value={publishAt} onChange={(e) => setPublishAt(e.target.value)} />
                        </Field>
                        <Button type="button" variant="outline" disabled={processing || !publishAt} onClick={() => submit('schedule')}><CalendarClock /> Schedule</Button>
                        <Button type="button" disabled={processing} onClick={() => submit('publish')} className="hover:bg-primary-hover"><Send /> Publish now</Button>
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">Publishing makes this advertisement visible on the public website and applicant portal immediately (or at the scheduled time).</p>
                </section>
            )}
        </div>,
    ][step];

    return (
        <div className="mx-auto grid w-full max-w-[96rem] gap-6">
            <Head title={`${isEdit ? 'Edit' : 'Create'} Recruitment – Admin`} />

            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <Link href="/admin/recruitments" className="mb-1 inline-flex items-center gap-1 text-sm text-link hover:underline"><ArrowLeft className="size-4" /> All recruitments</Link>
                    <h1 className="text-2xl font-semibold text-primary-deep">{isEdit ? `Edit: ${recruitment.basic.advt_no}` : 'Create Recruitment'}</h1>
                </div>
                {recruitment && <span className={cn('rounded-full px-3 py-1 text-sm font-medium', STATUS_TONE[recruitment.status])}>{STATUS_LABEL[recruitment.status]}</span>}
            </div>

            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_19rem] lg:items-start">
                <div className="order-2 grid min-w-0 gap-8 lg:order-1">
                {/* After publishing only the description, dates and attachments stay editable. */}
                <fieldset disabled={locked && ![0, 6, 7, 8].includes(step)} className="min-w-0 disabled:opacity-60">
                    {stepBody}
                </fieldset>
                {locked && ![0, 6, 7, 8].includes(step) && <p className="-mt-3 text-sm text-muted-foreground">These details are locked after publishing.</p>}

                <div className="flex flex-wrap items-center justify-between gap-3">
                    <Button type="button" variant="outline" disabled={step === 0} onClick={() => goTo((s) => s - 1)}><ArrowLeft /> Back</Button>
                    <div className="flex flex-wrap gap-3">
                        {locked ? (
                            <Button type="button" disabled={processing} onClick={() => submit('save')} className="hover:bg-primary-hover">
                                {processing ? <Loader2 className="animate-spin" /> : <Save />} Save changes
                            </Button>
                        ) : (
                            <Button type="button" variant="secondary" disabled={processing} onClick={() => submit('draft')}>
                                {processing ? <Loader2 className="animate-spin" /> : <Save />} Save as draft
                            </Button>
                        )}
                        {!last && <Button type="button" disabled={step >= furthest} title={step >= furthest ? 'Fill in the required fields on this step to continue' : undefined} onClick={() => goTo((s) => s + 1)} className="hover:bg-primary-hover">Next <ArrowRight /></Button>}
                    </div>
                </div>
                </div>
                <div className="order-1 lg:order-2">
                    <RecruitmentStepSidebar current={step} visited={visited} errorSteps={stepsWithErrors} furthest={furthest} onSelect={goTo} />
                </div>
            </div>
        </div>
    );
}

RecruitmentFormPage.layout = (page: ReactNode) => <AdminLayout>{page}</AdminLayout>;
