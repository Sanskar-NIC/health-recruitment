import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2, RotateCcw, Save, UserCog } from 'lucide-react';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { toast } from 'sonner';
import { ApiError, saveProfileStep, submitProfile } from '@/api/profile.api';
import { Panel } from '@/components/student/panel';
import { AddressStep } from '@/components/student/profile/address-step';
import { ExperienceStep } from '@/components/student/profile/experience-step';
import { OtherStep } from '@/components/student/profile/other-step';
import { PersonalStep } from '@/components/student/profile/personal-step';
import { QualificationsStep } from '@/components/student/profile/qualifications-step';
import { UploadsStep } from '@/components/student/profile/uploads-step';
import { StepSidebar } from '@/components/student/profile/step-sidebar';
import { Button } from '@/components/ui/button';
import StudentPortalLayout from '@/layouts/student-portal-layout';
import { REQUIRED_STEPS, STEP_KEYS, STEP_LABELS, toDraft, toPayload } from '@/lib/profile';
import type { ProfileDraft, ProfileOptionsData, ServerProfile, StepKey, UploadRule } from '@/lib/profile';

interface Props {
    profile: ServerProfile;
    options: ProfileOptionsData;
    uploadRules: Record<string, UploadRule>;
}

export default function Profile({ profile, options, uploadRules }: Props) {
    const [draft, setDraft] = useState<ProfileDraft>(() => toDraft(profile));
    const [step, setStep] = useState(() => Math.min(Math.max(profile.current_step, 1), STEP_KEYS.length) - 1);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [busy, setBusy] = useState<'draft' | 'next' | null>(null);
    const [completed, setCompleted] = useState(profile.status === 'completed');
    const [saved, setSaved] = useState<ProfileDraft>(draft);
    const [doneSteps, setDoneSteps] = useState<number[]>(profile.completed_steps);
    // Every step is open for editing; only the final submit is gated. Experience is optional.
    const canSubmit = REQUIRED_STEPS.every((n) => n === step + 1 || doneSteps.includes(n));

    const key = STEP_KEYS[step];
    const isLast = step === STEP_KEYS.length - 1;
    const err = (path: string) => errors[path];

    const patch = <K extends StepKey>(stepKey: K) => (value: unknown) => {
        setDraft((d) => ({
            ...d,
            [stepKey]: Array.isArray(d[stepKey]) ? value : { ...(d[stepKey] as object), ...(value as object) },
        }));
        // Clear stale errors for the touched step as the user edits.
        setErrors({});
    };

    const save = async (asDraft: boolean) => {
        setBusy(asDraft ? 'draft' : 'next');
        setErrors({});

        try {
            const res = await saveProfileStep(key, toPayload(key, draft), asDraft);

            // Pick up server-normalised values (e.g. computed percentage, copied address).
            const fresh = toDraft(res.profile);

            setDraft(fresh);
            setSaved(fresh);
            setDoneSteps(res.profile.completed_steps);

            if (asDraft) {
                toast.success(res.message);

                return;
            }

            if (isLast) {
                const done = await submitProfile();

                setCompleted(true);
                toast.success(done.message);
                window.scrollTo({ top: 0, behavior: 'smooth' });

                return;
            }

            toast.success(res.message);
            setStep((n) => n + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (e) {
            if (e instanceof ApiError) {
                setErrors(e.errors);
                toast.error(Object.keys(e.errors).length > 1 ? 'Please correct the highlighted fields' : e.message);
            } else {
                toast.error('Could not save. Please try again.');
            }
        } finally {
            setBusy(null);
        }
    };

    const reset = () => {
        setDraft((d) => ({ ...d, [key]: saved[key] }));
        setErrors({});
    };

    const common = { err, options, rules: uploadRules };

    if (completed) {
        return (
            <div className="mx-auto max-w-3xl px-4 py-10">
                <Head title="My Profile" />
                <Panel title="Profile Completed" icon={CheckCircle2}>
                    <p className="text-sm text-muted-foreground">Your profile has been submitted. You can now apply to active recruitments.</p>
                    <div className="mt-4 flex gap-3">
                        <Button asChild><Link href="/recruitments">Browse Recruitments</Link></Button>
                        <Button variant="outline" onClick={() => setCompleted(false)}>Edit Profile</Button>
                        <Button variant="ghost" onClick={() => router.visit('/student/dashboard')}>Dashboard</Button>
                    </div>
                </Panel>
            </div>
        );
    }

    return (
        <div className="px-4 py-8 sm:px-8 lg:px-16 xl:px-24">
            <Head title="My Profile" />
            <div className="mb-6">
                <h1 className="text-2xl font-bold tracking-tight text-primary-deep">Applicant Profile</h1>
                <p className="text-sm text-muted-foreground">Complete all six steps. You can save a draft at any time and continue later.</p>
            </div>

            <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
                <div className="order-2 overflow-hidden rounded-2xl border bg-card shadow-sm lg:order-1">
                    <header className="flex items-center gap-3 border-b px-6 py-5">
                        <span className="flex size-11 items-center justify-center rounded-full bg-primary text-primary-foreground">
                            <UserCog className="size-5" aria-hidden="true" />
                        </span>
                        <h2 className="text-lg font-semibold text-primary-deep">{step + 1}. {STEP_LABELS[step]}</h2>
                    </header>

                    <form
                        noValidate
                        onSubmit={(e) => {
                            e.preventDefault();
                            void save(false);
                        }}
                    >
                        <div className="p-6">
                            {key === 'personal' && <PersonalStep data={draft.personal} set={patch('personal')} {...common} />}
                            {key === 'address' && <AddressStep data={draft.address} set={patch('address')} {...common} />}
                            {key === 'other' && <OtherStep data={draft.other} set={patch('other')} gender={draft.personal.gender} {...common} />}
                            {key === 'experience' && <ExperienceStep data={draft.experience} set={patch('experience')} {...common} />}
                            {key === 'qualifications' && <QualificationsStep data={draft.qualifications} set={patch('qualifications')} {...common} />}
                            {key === 'uploads' && <UploadsStep data={draft.uploads} set={patch('uploads')} {...common} />}
                        </div>

                        <footer className="flex flex-wrap items-center justify-between gap-3 border-t bg-muted/20 px-6 py-4">
                            <Button type="button" variant="outline" disabled={step === 0 || busy !== null} onClick={() => setStep((n) => n - 1)}>
                                <ArrowLeft className="mr-1.5 size-4" /> Back
                            </Button>
                            <div className="flex flex-wrap gap-3">
                                <Button type="button" variant="outline" disabled={busy !== null} onClick={reset} className="border-amber-400 bg-amber-50 text-amber-700 hover:bg-amber-100">
                                    <RotateCcw className="mr-1.5 size-4" /> Reset
                                </Button>
                                <Button type="button" variant="outline" disabled={busy !== null} onClick={() => void save(true)}>
                                    {busy === 'draft' ? <Loader2 className="mr-1.5 size-4 animate-spin" /> : <Save className="mr-1.5 size-4" />}
                                    Save Draft
                                </Button>
                                <Button type="submit" disabled={busy !== null || (isLast && !canSubmit)} title={isLast && !canSubmit ? 'Complete all required steps (Experience is optional) to submit' : undefined}>
                                    {busy === 'next' && <Loader2 className="mr-1.5 size-4 animate-spin" />}
                                    {isLast ? 'Save & Submit' : 'Next'}
                                    {!isLast && busy !== 'next' && <ArrowRight className="ml-1.5 size-4" />}
                                </Button>
                            </div>
                        </footer>
                    </form>
                </div>

                <div className="order-1 lg:order-2">
                    <StepSidebar current={step} completed={doneSteps} reachable={STEP_KEYS.length - 1} onSelect={setStep} />
                </div>
            </div>
        </div>
    );
}

Profile.layout = (page: ReactNode) => <StudentPortalLayout>{page}</StudentPortalLayout>;
