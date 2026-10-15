export interface FileRef {
    path: string;
    name: string;
    size: number;
}

export type YesNo = 'yes' | 'no' | '';

export interface PersonalData {
    is_tripura_resident: YesNo;
    prtc_number: string;
    prtc_district: string;
    prtc_issue_date: string;
    prtc_certificate: FileRef | null;
    title: string;
    name: string;
    mobile: string;
    email: string;
    father_name: string;
    mother_name: string;
    nationality: string;
    gender: string;
    mother_tongue: string;
    dob: string;
    marital_status: string;
    aadhaar_no: string;
    aadhaar_name: string;
    aadhaar_front: FileRef | null;
    aadhaar_back: FileRef | null;
    category: string;
    cert_number: string;
    cert_district: string;
    cert_date: string;
    is_pwd: YesNo;
    ph_percentage: string;
}

export interface AddressBlock {
    house: string;
    street: string;
    locality: string;
    po: string;
    ps: string;
    pincode: string;
    state: string;
    city: string;
    district: string;
}

export interface AddressData {
    permanent: AddressBlock;
    same_as_permanent: boolean;
    correspondence: AddressBlock;
}

export interface OtherData {
    is_bpl: YesNo;
    bpl_number: string;
    bpl_district: string;
    bpl_date: string;
    is_govt_employee: YesNo;
    is_ex_serviceman: YesNo;
    height_cm: string;
    chest_cm: string;
    weight_kg: string;
}

export interface ExperienceEntry {
    employer: string;
    designation: string;
    sector: string;
    from_date: string;
    to_date: string;
    currently_working: boolean;
    document: FileRef | null;
}

export interface ExperienceData {
    has_experience: YesNo;
    entries: ExperienceEntry[];
}

export interface Qualification {
    type: string;
    stream: string;
    result_status: string;
    year: string;
    marks_type: string;
    out_of: string;
    obtained: string;
    percentage: string;
    state: string;
    board: string;
    document: FileRef | null;
}

export interface UploadsData {
    photo: FileRef | null;
    signature: FileRef | null;
}

export interface ProfileDraft {
    personal: PersonalData;
    address: AddressData;
    other: OtherData;
    experience: ExperienceData;
    qualifications: Qualification[];
    uploads: UploadsData;
}

export type StepKey = keyof ProfileDraft;

export const STEP_KEYS: StepKey[] = ['personal', 'address', 'other', 'qualifications', 'experience', 'uploads'];

/** Step numbers (1-based) that must be complete to submit. Experience (5) is optional. */
export const REQUIRED_STEPS = [1, 2, 3, 4, 6];

export const STEP_LABELS = ['Personal Information', 'Address Details', 'Other Details', 'Qualification Details', 'Experience Details', 'Photo & Signature'];

export interface ProfileOptionsData {
    titles: string[];
    genders: string[];
    maritalStatuses: string[];
    categories: string[];
    districts: string[];
    qualificationTypes: string[];
    streams: string[];
    resultStatuses: string[];
    marksTypes: string[];
    sectors: string[];
}

export interface UploadRule {
    mimes: string;
    min: number;
    max: number;
    ratio?: [number, number];
}

/** Shape sent by the server (any step may be null on a fresh draft). */
export interface ServerProfile {
    status: 'draft' | 'completed';
    current_step: number;
    completed_steps: number[];
    personal: Partial<PersonalData>;
    address: Partial<AddressData> | null;
    other: Partial<OtherData> | null;
    experience: Partial<ExperienceData> | null;
    qualifications: Partial<Qualification>[];
    uploads: Partial<UploadsData> | null;
}

export const emptyAddressBlock: AddressBlock = {
    house: '', street: '', locality: '', po: '', ps: '', pincode: '', state: 'TRIPURA', city: '', district: '',
};

export const emptyExperience: ExperienceEntry = {
    employer: '', designation: '', sector: '', from_date: '', to_date: '', currently_working: false, document: null,
};

export const emptyQualification: Qualification = {
    type: '', stream: '', result_status: '', year: '', marks_type: 'MARKS',
    out_of: '', obtained: '', percentage: '', state: '', board: '', document: null,
};

const str = (v: unknown) => (v === null || v === undefined ? '' : String(v));

const block = (b?: Partial<AddressBlock> | null): AddressBlock => ({
    ...emptyAddressBlock,
    ...Object.fromEntries(Object.entries(b ?? {}).map(([k, v]) => [k, str(v)])),
    state: str(b?.state) || 'TRIPURA',
});

/** Normalise server data (nulls, numbers) into controlled-input friendly strings. */
export function toDraft(server: ServerProfile): ProfileDraft {
    const p = server.personal ?? {};
    const a = server.address ?? {};
    const o = server.other ?? {};

    return {
        personal: {
            is_tripura_resident: (p.is_tripura_resident ?? 'no') as YesNo,
            prtc_number: str(p.prtc_number),
            prtc_district: str(p.prtc_district),
            prtc_issue_date: str(p.prtc_issue_date),
            prtc_certificate: p.prtc_certificate ?? null,
            title: str(p.title),
            name: str(p.name),
            mobile: str(p.mobile),
            email: str(p.email),
            father_name: str(p.father_name),
            mother_name: str(p.mother_name),
            nationality: str(p.nationality) || 'INDIAN',
            gender: str(p.gender),
            mother_tongue: str(p.mother_tongue),
            dob: str(p.dob),
            marital_status: str(p.marital_status),
            aadhaar_no: str(p.aadhaar_no),
            aadhaar_name: str(p.aadhaar_name),
            aadhaar_front: p.aadhaar_front ?? null,
            aadhaar_back: p.aadhaar_back ?? null,
            category: str(p.category),
            cert_number: str(p.cert_number),
            cert_district: str(p.cert_district),
            cert_date: str(p.cert_date),
            is_pwd: (p.is_pwd ?? 'no') as YesNo,
            ph_percentage: str(p.ph_percentage),
        },
        address: {
            permanent: block(a.permanent),
            same_as_permanent: Boolean(a.same_as_permanent),
            correspondence: block(a.correspondence),
        },
        other: {
            is_bpl: (o.is_bpl ?? 'no') as YesNo,
            bpl_number: str(o.bpl_number),
            bpl_district: str(o.bpl_district),
            bpl_date: str(o.bpl_date),
            is_govt_employee: (o.is_govt_employee ?? 'no') as YesNo,
            is_ex_serviceman: (o.is_ex_serviceman ?? 'no') as YesNo,
            height_cm: str(o.height_cm),
            chest_cm: str(o.chest_cm),
            weight_kg: str(o.weight_kg),
        },
        experience: {
            has_experience: (server.experience?.has_experience ?? 'no') as YesNo,
            entries: (server.experience?.entries ?? []).map((e) => ({
                ...emptyExperience,
                employer: str(e.employer),
                designation: str(e.designation),
                sector: str(e.sector),
                from_date: str(e.from_date),
                to_date: str(e.to_date),
                currently_working: Boolean(e.currently_working),
                document: e.document ?? null,
            })),
        },
        qualifications: (server.qualifications ?? []).map((q) => ({
            ...emptyQualification,
            ...Object.fromEntries(Object.entries(q).filter(([k]) => k !== 'document').map(([k, v]) => [k, str(v)])),
            document: q.document ?? null,
        })),
        uploads: {
            photo: server.uploads?.photo ?? null,
            signature: server.uploads?.signature ?? null,
        },
    };
}

/** Payload for the server: empty strings become null; Aadhaar spaces stripped. */
export function toPayload(step: StepKey, draft: ProfileDraft): unknown {
    const clean = (v: unknown): unknown => {
        if (v === '') {
            return null;
        }

        if (Array.isArray(v)) {
            return v.map(clean);
        }

        if (v && typeof v === 'object') {
            return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, clean(x)]));
        }

        return v;
    };

    if (step === 'qualifications') {
        return clean({ qualifications: draft.qualifications });
    }

    if (step === 'personal') {
        return clean({ ...draft.personal, aadhaar_no: draft.personal.aadhaar_no.replace(/\D/g, '') });
    }

    return clean(draft[step]);
}

export function ageDetail(dob: string): string | null {
    const d = new Date(dob);

    if (!dob || Number.isNaN(d.getTime())) {
        return null;
    }

    const now = new Date();
    let years = now.getFullYear() - d.getFullYear();
    let months = now.getMonth() - d.getMonth();
    let days = now.getDate() - d.getDate();

    if (days < 0) {
        months -= 1;
        days += new Date(now.getFullYear(), now.getMonth(), 0).getDate();
    }

    if (months < 0) {
        years -= 1;
        months += 12;
    }

    return `${years} Years, ${months} Months, ${days} Days`;
}

export function formatAadhaar(value: string): string {
    return value.replace(/\D/g, '').slice(0, 12).replace(/(\d{4})(?=\d)/g, '$1 ');
}
