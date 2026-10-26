import type { RecruitmentForm } from '@/components/admin/recruitment/types';

const fmt = (iso: string) => {
    if (!iso) return '';
    const [y, m, d] = iso.split('-');

    return `${d}-${m}-${y}`;
};

/** The human-readable rule the candidate side enforces, e.g. "Age 18–40 as on 01-01-2027 (SC +5, OBC +3)…". */
export function eligibilitySummary(form: RecruitmentForm): string {
    const e = form.eligibility;
    const parts: string[] = [];

    if (e.age_min || e.age_max) {
        const relax = Object.entries(e.relaxations)
            .filter(([, v]) => Number(v) > 0)
            .map(([k, v]) => `${k} +${v}`)
            .join(', ');

        parts.push(`Age ${e.age_max ? `${e.age_min || '?'}–${e.age_max}` : `${e.age_min || '?'} and above`}${e.age_cutoff ? ` as on ${fmt(e.age_cutoff)}` : ''}${relax ? ` (${relax})` : ''}.`);
    }

    const quals = e.qualifications.filter((q) => q.name);

    if (quals.length) {
        parts.push(`${quals.map((q) => (q.min_percent ? `${q.name} with min ${q.min_percent}%` : q.name)).join(' or ')}.`);
    }

    if (e.council) parts.push(`Must be registered with ${e.council}.`);
    if (Number(e.min_experience_years) > 0) parts.push(`Minimum ${e.min_experience_years} year(s) experience.`);
    if (e.prtc_required) parts.push('PRTC holders only.');
    if (e.gender !== 'any') parts.push(`${e.gender === 'female' ? 'Female' : 'Male'} candidates only.`);

    return parts.join(' ') || 'No eligibility rules entered yet.';
}

export interface EligibilityCase {
    dob: string;
    category: string;
    pwbd: boolean;
    qualification: string;
    percent: string;
    councilRegistered: boolean;
    prtc: boolean;
    gender: 'male' | 'female';
    experience: string;
}

export function testEligibility(form: RecruitmentForm, c: EligibilityCase): { ok: boolean; reasons: string[] } {
    const e = form.eligibility;
    const reasons: string[] = [];

    if (c.dob && e.age_cutoff) {
        const dob = new Date(`${c.dob}T00:00:00`);
        const cutoff = new Date(`${e.age_cutoff}T00:00:00`);
        let age = cutoff.getFullYear() - dob.getFullYear();

        if (cutoff.getMonth() < dob.getMonth() || (cutoff.getMonth() === dob.getMonth() && cutoff.getDate() < dob.getDate())) age--;

        const relax = (Number(e.relaxations[c.category]) || 0) + (c.pwbd ? Number(e.relaxations.PwBD) || 0 : 0);
        const max = Number(e.age_max) + relax;

        if (e.age_min && age < Number(e.age_min)) reasons.push(`Age ${age} is below the minimum ${e.age_min}.`);
        if (e.age_max && age > max) reasons.push(`Age ${age} exceeds the maximum ${max} (limit ${e.age_max} + ${relax} relaxation).`);
    } else {
        reasons.push('Enter a date of birth (and set the age cut-off date) to check age.');
    }

    const quals = e.qualifications.filter((q) => q.name);

    if (quals.length) {
        const match = quals.find((q) => q.name === c.qualification);

        if (!match) reasons.push(`${c.qualification || 'Qualification'} is not an accepted qualification.`);
        else if (match.min_percent && Number(c.percent) < Number(match.min_percent)) reasons.push(`Needs at least ${match.min_percent}% (has ${c.percent || 0}%).`);
    }

    if (e.council && !c.councilRegistered) reasons.push(`Not registered with ${e.council}.`);
    if (e.prtc_required && !c.prtc) reasons.push('PRTC is required.');
    if (e.gender !== 'any' && e.gender !== c.gender) reasons.push(`Only ${e.gender} candidates are eligible.`);
    if (Number(e.min_experience_years) > Number(c.experience || 0)) reasons.push(`Needs ${e.min_experience_years} year(s) experience.`);

    return { ok: reasons.length === 0, reasons };
}
