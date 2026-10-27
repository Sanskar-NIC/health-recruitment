export type RecruitmentStatus = 'open' | 'closing_soon' | 'upcoming' | 'closed';

export interface Recruitment {
    id: number;
    advtNo: string;
    postName: string;
    department: string;
    vacancies: number;
    qualification: string;
    ageLimit: string;
    payScale: string;
    startDate: string;
    endDate: string;
    status: RecruitmentStatus;
    isNew: boolean;
    pdfUrl: string;
    summary: string | null;
    selectionMode: 'exam' | 'interview';
    applyMode: 'online' | 'walk_in';
    interview: {
        date: string | null;
        dateTo: string | null;
        time: string | null;
        venue: string | null;
        instructions: string | null;
        documentsToCarry: string | null;
    } | null;
}

export type NotificationType =
    | 'advertisement'
    | 'corrigendum'
    | 'admit_card'
    | 'result'
    | 'answer_key'
    | 'notice';

export interface NotificationItem {
    id: number;
    title: string;
    date: string;
    type: NotificationType;
    isNew: boolean;
    url: string;
}

export interface ImportantDate {
    label: string;
    date: string;
}

export interface PortalStats {
    totalVacancies: number;
    activeRecruitments: number;
    registeredApplicants: number;
    districtsCovered: number;
}

export interface Faq {
    id: string;
    question: string;
    answer: string;
}

export interface Helpdesk {
    phone: string;
    email: string;
    hours: string;
    address: string;
}

export interface PortalShared {
    helpdesk: Helpdesk;
    ticker: NotificationItem[];
    siteMeta: {
        lastUpdated: string;
        visitors: string;
    };
}

export type NotificationLinkKind = 'download' | 'apply' | 'form';

export interface NotificationLink {
    id: string;
    kind: NotificationLinkKind;
    label: string;
    meta: string | null;
    isNew: boolean;
    url: string;
}

export interface NotificationEntry {
    id: number;
    title: string;
    highlight: string;
    advtNo: string;
    status: RecruitmentStatus;
    lastDate: string;
    isNew: boolean;
    links: NotificationLink[];
}

export interface HomeProps {
    recruitments: Recruitment[];
    notifications: NotificationItem[];
    importantDates: ImportantDate[];
    featuredRecruitment: Recruitment | null;
    stats: PortalStats;
    faqs: Faq[];
}

export interface RecruitmentPostDetail {
    id: number;
    name: string;
    code: string | null;
    monthlySalary: number | null;
    isContractual: boolean;
    contract: string | null;
    minimumQualification: string | null;
    preferableQualification: string | null;
    ageMax: number | null;
    experienceYears: number | null;
    experienceCriteria: string | null;
    reservedFor: string | null;
    vacancies: number;
    categoryBreakup: Record<string, number>;
    womenBreakup: Record<string, number | string | null>;
}

export interface RecruitmentDetail extends Recruitment {
    referenceNo: string | null;
    notificationDate: string | null;
    description: string | null;
    syllabusUrl: string | null;
    dates: ImportantDate[];
    posts: RecruitmentPostDetail[];
    eligibility: {
        ageMin: number | null;
        ageMax: number | null;
        ageCutoff: string | null;
        relaxations: Record<string, number>;
        qualifications: { name: string; min_percent?: number | null }[];
        council: string | null;
        minExperienceYears: number | null;
        prtcRequired: boolean;
        gender: 'any' | 'male' | 'female';
    };
    fees: Record<string, number | string>;
    documents: {
        required: string[];
        photo: { min_kb?: number; max_kb?: number } | null;
        signature: { min_kb?: number; max_kb?: number } | null;
    };
}

export interface EligibilityCheck {
    key: string;
    label: string;
    status: 'pass' | 'fail' | 'info';
    message: string;
}

export interface ApplicationSummary {
    id: number;
    applicationNo: string;
    status: 'submitted' | 'withdrawn';
    category: string;
    feeAmount: number;
    feeStatus: 'not_required' | 'pending' | 'paid';
    submittedAt: string | null;
    recruitmentId: number;
    advtNo: string;
    title: string;
    postName: string;
    recruitmentStatus: string;
    lastDate: string | null;
    canWithdraw: boolean;
}
