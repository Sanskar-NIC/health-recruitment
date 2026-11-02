import { router } from '@inertiajs/react';
import { NativeSelect } from '@/components/admin/recruitment/ui';

export interface RecruitmentOption {
    id: number;
    advt_no: string;
    title: string;
}

/** Every exam-flow page works on one recruitment; picking one reloads the page with ?recruitment=. */
export function RecruitmentPicker({ path, recruitments, value }: { path: string; recruitments: RecruitmentOption[]; value: number | null }) {
    return (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-card p-3 shadow-sm">
            <label htmlFor="recruitment-picker" className="text-sm font-medium">Recruitment</label>
            <NativeSelect
                id="recruitment-picker"
                className="min-w-72 flex-1 sm:max-w-xl"
                value={value ?? ''}
                onChange={(e) => router.get(path, e.target.value ? { recruitment: e.target.value } : {}, { preserveScroll: true })}
            >
                <option value="">Select a recruitment…</option>
                {recruitments.map((r) => <option key={r.id} value={r.id}>{r.advt_no} – {r.title}</option>)}
            </NativeSelect>
        </div>
    );
}

export function PickRecruitmentHint() {
    return <div className="rounded-lg border border-dashed bg-card py-14 text-center text-sm text-muted-foreground">Select a recruitment above to continue.</div>;
}

export function PageTitle({ title, description }: { title: string; description: string }) {
    return (
        <div>
            <h1 className="text-2xl font-semibold text-primary-deep">{title}</h1>
            <p className="text-sm text-muted-foreground">{description}</p>
        </div>
    );
}
