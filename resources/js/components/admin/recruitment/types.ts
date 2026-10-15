export type RecruitmentStatus = 'draft' | 'scheduled' | 'upcoming' | 'open' | 'closing_soon' | 'closed' | 'cancelled';

export interface Options {
    categories: string[];
    horizontal: Record<string, string>;
    groups: string[];
    relaxations: string[];
    feeCategories: string[];
    qualifications: string[];
    councils: string[];
    documents: Record<string, string>;
    districts: string[];
}

export interface PostForm {
    name: string;
    code: string;
    pay_level: string;
    group: string;
    total_vacancies: string;
    category_breakup: Record<string, string>;
    /** PwBD is one overall number; women / Ex-Servicemen are reserved inside each category (all optional). */
    horizontal: { pwbd: string; women: Record<string, string>; ex_serviceman: Record<string, string> };
    district_breakup: { district: string; vacancies: string }[];
}

export interface RecruitmentForm {
    basic: {
        advt_no: string;
        title: string;
        directorate: string;
        reference_no: string;
        notification_date: string;
        description: string;
    };
    posts: PostForm[];
    eligibility: {
        age_min: string;
        age_max: string;
        age_cutoff: string;
        relaxations: Record<string, string>;
        qualifications: { name: string; min_percent: string }[];
        council: string;
        min_experience_years: string;
        prtc_required: boolean;
        gender: 'any' | 'male' | 'female';
    };
    fees: { amounts: Record<string, string> };
    documents: {
        required: string[];
        photo: { min_kb: string; max_kb: string };
        signature: { min_kb: string; max_kb: string };
    };
    dates: {
        app_start: string;
        app_end: string;
        fee_last_date: string;
        correction_end: string;
        admit_card_date: string;
        exam_date: string;
        result_date: string;
    };
}

/** Server shape for an existing recruitment (see RecruitmentPresenter::form). */
export interface RecruitmentRecord extends RecruitmentForm {
    id: number;
    status: RecruitmentStatus;
    locked: boolean;
    publish_at: string | null;
    status_reason: string | null;
    advertisement_url: string | null;
    syllabus_url: string | null;
}

export interface RecruitmentEventItem {
    id: number;
    type: 'created' | 'edited' | 'published' | 'scheduled' | 'extended' | 'closed' | 'cancelled';
    reason: string | null;
    meta: Record<string, unknown> | null;
    by: string | null;
    at: string;
}

export const newPost = (options: Options): PostForm => ({
    name: '',
    code: '',
    pay_level: '',
    group: '',
    total_vacancies: '',
    category_breakup: Object.fromEntries(options.categories.map((c) => [c, ''])),
    horizontal: { pwbd: '', women: Object.fromEntries(options.categories.map((c) => [c, ''])), ex_serviceman: Object.fromEntries(options.categories.map((c) => [c, ''])) },
    district_breakup: [],
});

export const emptyForm = (options: Options): RecruitmentForm => ({
    basic: { advt_no: '', title: '', directorate: 'Directorate of Health Services, Government of Tripura', reference_no: '', notification_date: '', description: '' },
    posts: [newPost(options)],
    eligibility: {
        age_min: '18',
        age_max: '',
        age_cutoff: '',
        relaxations: { SC: '5', ST: '5', OBC: '3', EWS: '0', PwBD: '10', ExServiceman: '' },
        qualifications: [],
        council: '',
        min_experience_years: '',
        prtc_required: false,
        gender: 'any',
    },
    fees: { amounts: { UR: '', SC: '0', ST: '0', OBC: '', EWS: '', PwBD: '0' } },
    documents: {
        required: ['class10_certificate', 'degree_certificate', 'id_proof'],
        photo: { min_kb: '20', max_kb: '50' },
        signature: { min_kb: '10', max_kb: '20' },
    },
    dates: { app_start: '', app_end: '', fee_last_date: '', correction_end: '', admit_card_date: '', exam_date: '', result_date: '' },
});

/** Fill any gaps in a server record so every input stays controlled. */
export function hydrate(record: RecruitmentForm, options: Options): RecruitmentForm {
    const base = emptyForm(options);
    const str = (v: unknown) => (v === null || v === undefined ? '' : String(v));
    const strMap = (m: Record<string, unknown> | null | undefined, keys: string[]) => Object.fromEntries(keys.map((k) => [k, str(m?.[k])]));

    return {
        basic: { ...base.basic, ...Object.fromEntries(Object.entries(record.basic).map(([k, v]) => [k, str(v)])) } as RecruitmentForm['basic'],
        posts: (record.posts.length ? record.posts : [newPost(options)]).map((p) => ({
            name: str(p.name),
            code: str(p.code),
            pay_level: str(p.pay_level),
            group: str(p.group),
            total_vacancies: str(p.total_vacancies),
            category_breakup: strMap(p.category_breakup, options.categories),
            horizontal: {
                pwbd: str(p.horizontal?.pwbd),
                women: strMap(p.horizontal?.women, options.categories),
                ex_serviceman: strMap(p.horizontal?.ex_serviceman, options.categories),
            },
            district_breakup: (p.district_breakup ?? []).map((d) => ({ district: d.district, vacancies: str(d.vacancies) })),
        })),
        eligibility: record.eligibility
            ? {
                  age_min: str(record.eligibility.age_min),
                  age_max: str(record.eligibility.age_max),
                  age_cutoff: str(record.eligibility.age_cutoff),
                  relaxations: strMap(record.eligibility.relaxations, options.relaxations),
                  qualifications: (record.eligibility.qualifications ?? []).map((q) => ({ name: q.name, min_percent: str(q.min_percent) })),
                  council: str(record.eligibility.council),
                  min_experience_years: str(record.eligibility.min_experience_years),
                  prtc_required: Boolean(record.eligibility.prtc_required),
                  gender: record.eligibility.gender ?? 'any',
              }
            : base.eligibility,
        fees: record.fees ? { amounts: strMap(record.fees.amounts, options.feeCategories) } : base.fees,
        documents: record.documents
            ? {
                  required: record.documents.required ?? [],
                  photo: { min_kb: str(record.documents.photo?.min_kb), max_kb: str(record.documents.photo?.max_kb) },
                  signature: { min_kb: str(record.documents.signature?.min_kb), max_kb: str(record.documents.signature?.max_kb) },
              }
            : base.documents,
        dates: { ...base.dates, ...Object.fromEntries(Object.entries(record.dates).map(([k, v]) => [k, str(v)])) } as RecruitmentForm['dates'],
    };
}

export const STEPS = [
    'Basic Info',
    'Posts',
    'Vacancy Breakup',
    'Eligibility',
    'Fee',
    'Documents',
    'Important Dates',
    'Attachments',
    'Review & Publish',
] as const;

/** Which wizard step (0-based) a validation-error key belongs to. */
export function stepForError(key: string): number {
    if (key.startsWith('basic')) return 0;
    if (key.includes('category_breakup') || key.includes('horizontal') || key.includes('district_breakup') || key.includes('total_vacancies')) return 2;
    if (key.startsWith('posts')) return 1;
    if (key.startsWith('eligibility')) return 3;
    if (key.startsWith('fees') || key === 'dates.fee_last_date') return 4;
    if (key.startsWith('documents')) return 5;
    if (key.startsWith('dates')) return 6;
    if (key.endsWith('_pdf')) return 7;

    return 8;
}

export const STATUS_LABEL: Record<RecruitmentStatus, string> = {
    draft: 'Draft',
    scheduled: 'Scheduled',
    upcoming: 'Published · Upcoming',
    open: 'Open',
    closing_soon: 'Closing soon',
    closed: 'Closed',
    cancelled: 'Cancelled',
};

export const STATUS_TONE: Record<RecruitmentStatus, string> = {
    draft: 'bg-gray-100 text-gray-700',
    scheduled: 'bg-sky-100 text-sky-700',
    upcoming: 'bg-indigo-100 text-indigo-700',
    open: 'bg-emerald-100 text-emerald-700',
    closing_soon: 'bg-amber-100 text-amber-800',
    closed: 'bg-slate-200 text-slate-700',
    cancelled: 'bg-red-100 text-red-700',
};
