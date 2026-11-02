import { Head } from '@inertiajs/react';
import { CircleCheck, LogIn, ShieldCheck } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import type { Variants } from 'motion/react';
import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { toast } from 'sonner';
import { LoginForm } from '@/components/student/login-form';
import StudentLayout from '@/layouts/student-layout';

const checklist = [
    'Keep your Registration No. or registered email ready.',
    'Use the password you set during registration.',
    'Do not share your password or OTP with anyone.',
];

// Animation 1: the card rises in and its content staggers in after it.
const card: Variants = {
    hidden: { opacity: 0, y: 32, scale: 0.97 },
    show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.55, ease: 'easeOut', staggerChildren: 0.09, delayChildren: 0.15 } },
};

const item: Variants = {
    hidden: { opacity: 0, y: 14 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

const slideRight: Variants = {
    hidden: { opacity: 0, x: -16 },
    show: { opacity: 1, x: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

export default function Login({ status }: { status?: string }) {
    useEffect(() => {
        if (status) {
            toast.success(status);
        }
    }, [status]);
    const reduce = useReducedMotion();

    return (
        <div className="relative mx-auto max-w-5xl px-4 py-10 sm:py-14">
            <Head title="Applicant Login" />

           
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
                <motion.span
                    className="absolute -top-10 -left-10 size-72 rounded-full bg-brand-start/20 blur-3xl"
                    animate={reduce ? undefined : { x: [0, 40, 0], y: [0, 30, 0] }}
                    transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.span
                    className="absolute -right-10 bottom-0 size-80 rounded-full bg-brand-end/20 blur-3xl"
                    animate={reduce ? undefined : { x: [0, -40, 0], y: [0, -30, 0] }}
                    transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
                />
            </div>

            <motion.div
                variants={card}
                initial="hidden"
                animate="show"
                className="grid overflow-hidden rounded-3xl border border-border/70 bg-card shadow-[0_24px_60px_-20px_rgb(14_116_144/0.35)] md:grid-cols-5"
            >
               
                <section className="relative overflow-hidden bg-gradient-to-br from-brand-start to-brand-end p-7 text-white sm:p-9 md:col-span-2">
                    <motion.span
                        aria-hidden="true"
                        className="pointer-events-none absolute -top-16 -right-16 size-56 rounded-full bg-white/10"
                        animate={reduce ? undefined : { scale: [1, 1.15, 1] }}
                        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    <span aria-hidden="true" className="pointer-events-none absolute -bottom-20 -left-12 size-52 rounded-full bg-white/5" />

                    <div className="relative">
                        <motion.span
                            variants={item}
                            className="flex size-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur"
                        >
                            <motion.span
                                animate={reduce ? undefined : { y: [0, -4, 0] }}
                                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                            >
                                <ShieldCheck className="size-7" aria-hidden="true" />
                            </motion.span>
                        </motion.span>
                        <motion.h2 variants={item} className="mt-5 text-2xl font-bold tracking-tight">Before you log in</motion.h2>

                        <ul className="mt-4 space-y-3 text-sm">
                            {checklist.map((text) => (
                                <motion.li key={text} variants={slideRight} className="flex gap-2.5">
                                    <CircleCheck className="mt-0.5 size-4 shrink-0 text-white/90" aria-hidden="true" />
                                    <span className="text-white/90">{text}</span>
                                </motion.li>
                            ))}
                        </ul>
                    </div>
                </section>

               
                <section className="p-7 sm:p-10 md:col-span-3">
                    <motion.div variants={item} className="flex items-center gap-3">
                        <span className="flex size-11 items-center justify-center rounded-xl bg-primary-tint text-primary">
                            <LogIn className="size-5" aria-hidden="true" />
                        </span>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-primary-deep">Applicant Login</h1>
                            <p className="text-sm text-muted-foreground">Sign in to apply and track your applications.</p>
                        </div>
                    </motion.div>

                    <motion.div variants={item} className="mt-7">
                        <LoginForm idPrefix="login" showRemember />
                    </motion.div>
                </section>
            </motion.div>
        </div>
    );
}

Login.layout = (page: ReactNode) => <StudentLayout>{page}</StudentLayout>;
