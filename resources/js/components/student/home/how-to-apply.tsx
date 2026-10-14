import { SectionHeading } from '@/components/student/section-heading';

const steps = [
    ['Register', 'Create your account with OTP verification'],
    ['Complete Profile', 'Add education, photo and signature'],
    ['Apply for Post', 'Select the post and submit the form'],
    ['Pay Fee', 'Pay the application fee online'],
    ['Download Acknowledgement / Admit Card', 'Keep a printout for your records'],
];

export function HowToApply() {
    return (
        <section aria-labelledby="how-heading" className="border-y bg-card">
            <div className="mx-auto max-w-none sm:px-8 lg:px-16 xl:px-24 px-4 py-10">
                <SectionHeading id="how-heading" title="How to Apply" />
                <ol className="grid gap-6 md:grid-cols-5 md:gap-0">
                    {steps.map(([title, text], index) => (
                        <li key={title} className="relative flex gap-4 md:flex-col md:items-center md:gap-3 md:text-center">
                            {index < steps.length - 1 && (
                                <span aria-hidden="true" className="absolute top-12 left-5 h-[calc(100%-1rem)] w-0.5 bg-primary/40 md:top-5 md:left-1/2 md:h-0.5 md:w-full" />
                            )}
                            <span className="relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-semibold text-white shadow-md ring-4 ring-primary-tint">
                                {index + 1}
                            </span>
                            <div className="md:px-3">
                                <h3 className="font-medium text-foreground">{title}</h3>
                                <p className="text-sm text-muted-foreground">{text}</p>
                            </div>
                        </li>
                    ))}
                </ol>
            </div>
        </section>
    );
}
