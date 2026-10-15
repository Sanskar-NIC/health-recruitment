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
