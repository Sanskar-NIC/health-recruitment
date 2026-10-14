import { Head, Link, router } from '@inertiajs/react';
import { Calendar, CheckCircle, FileText, IdCard, LogOut, Mail, Phone, ShieldCheck, User } from 'lucide-react';
import type { ReactNode } from 'react';
import { Panel } from '@/components/student/panel';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import StudentLayout from '@/layouts/student-layout';

interface StudentProps {
    student: {
        id: number;
        registration_no: string;
        full_name: string;
        father_name: string;
        mother_name: string;
        dob: string;
        gender: string;
        category: string;
        pwbd: string;
        mobile: string;
        email: string;
        created_at: string;
    };
}

export default function Dashboard({ student }: StudentProps) {
    const handleLogout = () => {
        router.post('/logout');
    };

    return (
        <div className="mx-auto max-w-6xl px-4 py-8">
            <Head title="Applicant Dashboard" />

            {/* Welcome Banner */}
            <div className="mb-6 flex flex-col justify-between gap-4 rounded-xl border bg-card p-6 shadow-sm md:flex-row md:items-center">
                <div>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="border-primary bg-primary-tint text-primary font-mono font-semibold">
                            {student.registration_no}
                        </Badge>
                        <span className="flex items-center gap-1 text-xs text-success font-medium">
                            <CheckCircle className="size-3.5" /> Active Session
                        </span>
                    </div>
                    <h1 className="mt-2 text-2xl font-bold tracking-tight text-primary-deep">
                        Welcome, {student.full_name}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Registered on {new Date(student.created_at).toLocaleDateString()}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button asChild className="hover:bg-primary-hover">
                        <Link href="/recruitments">
                            <FileText className="mr-2 size-4" /> Browse Recruitments
                        </Link>
                    </Button>
                    <Button variant="outline" onClick={handleLogout} className="border-destructive/30 text-destructive hover:bg-destructive/10">
                        <LogOut className="mr-2 size-4" /> Logout
                    </Button>
                </div>
            </div>

            {/* Profile Overview Panel */}
            <Panel title="Applicant Profile Details" icon={IdCard}>
                <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                            Personal Details
                        </h3>
                        <div className="space-y-2 rounded-lg border bg-muted/20 p-4 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Full Name:</span>
                                <span className="font-medium">{student.full_name}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Father's Name:</span>
                                <span className="font-medium">{student.father_name}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Mother's Name:</span>
                                <span className="font-medium">{student.mother_name}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Date of Birth:</span>
                                <span className="font-medium">{student.dob}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Gender / Category:</span>
                                <span className="font-medium">{student.gender} ({student.category})</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">PwBD Status:</span>
                                <span className="font-medium uppercase">{student.pwbd}</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                            Contact & Account Security
                        </h3>
                        <div className="space-y-2 rounded-lg border bg-muted/20 p-4 text-sm">
                            <div className="flex items-center justify-between">
                                <span className="flex items-center gap-2 text-muted-foreground">
                                    <Phone className="size-4 text-primary" /> Mobile:
                                </span>
                                <span className="font-medium">{student.mobile}</span>
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <span className="flex items-center gap-2 text-muted-foreground">
                                    <Mail className="size-4 text-primary" /> Email:
                                </span>
                                <span className="font-medium">{student.email}</span>
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <span className="flex items-center gap-2 text-muted-foreground">
                                    <ShieldCheck className="size-4 text-success" /> Password:
                                </span>
                                <span className="font-medium text-success">Encrypted &amp; Protected</span>
                            </div>
                        </div>

                        <div className="rounded-lg border border-primary/20 bg-primary-tint/30 p-4 text-sm">
                            <h4 className="font-medium text-primary-deep">Application Status</h4>
                            <p className="mt-1 text-xs text-muted-foreground">
                                You can now select active recruitment notifications and submit your applications using your registration credentials.
                            </p>
                        </div>
                    </div>
                </div>
            </Panel>
        </div>
    );
}

Dashboard.layout = (page: ReactNode) => <StudentLayout>{page}</StudentLayout>;
