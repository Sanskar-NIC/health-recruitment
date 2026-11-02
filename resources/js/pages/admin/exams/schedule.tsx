import { Head, useForm } from '@inertiajs/react';
import type { FormEvent, ReactNode } from 'react';
import { PageTitle, PickRecruitmentHint, RecruitmentPicker } from '@/components/admin/exam/recruitment-picker';
import type { RecruitmentOption } from '@/components/admin/exam/recruitment-picker';
import { Field, Textarea } from '@/components/admin/recruitment/ui';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AdminLayout from '@/layouts/admin-layout';

interface Schedule {
    exam_date: string;
    reporting_time: string;
    start_time: string;
    end_time: string;
    instructions: string;
}

interface Props {
    recruitments: RecruitmentOption[];
    recruitment: number | null;
    schedule: Schedule | null;
}

export default function ExamSchedule({ recruitments, recruitment, schedule }: Props) {
    return (
        <div className="mx-auto grid w-full max-w-4xl gap-5">
            <Head title="Exam Schedule – Admin" />
            <PageTitle title="Exam Schedule" description="Date, timings and instructions printed on every admit card of the recruitment." />
            <RecruitmentPicker path="/admin/exams/schedule" recruitments={recruitments} value={recruitment} />
            {recruitment && schedule ? <ScheduleForm key={recruitment} recruitment={recruitment} schedule={schedule} /> : <PickRecruitmentHint />}
        </div>
    );
}

function ScheduleForm({ recruitment, schedule }: { recruitment: number; schedule: Schedule }) {
    const form = useForm({ recruitment, ...schedule });
    const { data, setData, errors, processing } = form;

    const submit = (e: FormEvent) => {
        e.preventDefault();
        form.post('/admin/exams/schedule', { preserveScroll: true });
    };

    const input = (field: 'exam_date' | 'reporting_time' | 'start_time' | 'end_time', label: string, type: 'date' | 'time') => (
        <Field label={label} required error={errors[field]} htmlFor={`sch-${field}`}>
            <Input id={`sch-${field}`} type={type} value={data[field]} onChange={(e) => setData(field, e.target.value)} aria-invalid={Boolean(errors[field])} />
        </Field>
    );

    return (
        <form onSubmit={submit} className="grid gap-5 rounded-lg border bg-card p-5 shadow-sm sm:grid-cols-2 sm:p-6">
            {input('exam_date', 'Date of exam', 'date')}
            {input('reporting_time', 'Reporting time', 'time')}
            {input('start_time', 'Exam start time', 'time')}
            {input('end_time', 'Exam end time', 'time')}
            <Field label="Additional instructions" error={errors.instructions} htmlFor="sch-instructions" className="sm:col-span-2">
                <Textarea id="sch-instructions" rows={5} value={data.instructions} onChange={(e) => setData('instructions', e.target.value)} placeholder="One instruction per line. These are added to the standard instructions on the admit card." />
            </Field>
            <div className="sm:col-span-2">
                <Button type="submit" className="hover:bg-primary-hover" disabled={processing}>Save schedule</Button>
            </div>
        </form>
    );
}

ExamSchedule.layout = (page: ReactNode) => <AdminLayout>{page}</AdminLayout>;
