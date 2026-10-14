<?php

namespace App\Support;

/**
 * Static mock data for the public recruitment portal UI.
 * Replace each method body with a real query later; the page props stay the same.
 */
class MockData
{
    /**
     * @return list<array<string, mixed>>
     */
    public static function recruitments(): array
    {
        $rows = [
            ['Staff Nurse', 'GNM / B.Sc Nursing with State Nursing Council registration', 120, '18–40 years', '₹29,200 – ₹92,300 (Level 6)', '2026-10-01', '2026-10-30', 'open', true],
            ['Medical Officer (General Duty)', 'MBBS with valid Medical Council registration', 45, '21–40 years', '₹56,100 – ₹1,77,500 (Level 10)', '2026-09-20', '2026-10-18', 'closing_soon', true],
            ['Pharmacist', 'Diploma / B.Pharm with Pharmacy Council registration', 30, '18–38 years', '₹29,200 – ₹92,300 (Level 6)', '2026-10-05', '2026-11-05', 'open', false],
            ['Laboratory Technician', 'DMLT / B.Sc MLT from a recognised institute', 24, '18–38 years', '₹25,500 – ₹81,100 (Level 4)', '2026-09-25', '2026-10-17', 'closing_soon', false],
            ['ANM (Auxiliary Nurse Midwife)', 'Class 12 with ANM course and registration', 80, '18–40 years', '₹21,700 – ₹69,100 (Level 3)', '2026-11-10', '2026-12-10', 'upcoming', true],
            ['Radiographer', 'Diploma / B.Sc in Radiography', 12, '18–38 years', '₹29,200 – ₹92,300 (Level 6)', '2026-11-20', '2026-12-20', 'upcoming', false],
            ['Physiotherapist', 'BPT from a recognised university', 10, '18–40 years', '₹35,400 – ₹1,12,400 (Level 7)', '2026-08-01', '2026-08-31', 'closed', false],
            ['Dental Surgeon', 'BDS with Dental Council registration', 8, '21–40 years', '₹56,100 – ₹1,77,500 (Level 10)', '2026-07-15', '2026-08-14', 'closed', false],
            ['Ophthalmic Assistant', 'Diploma in Ophthalmic Technique', 14, '18–38 years', '₹25,500 – ₹81,100 (Level 4)', '2026-12-01', '2027-01-05', 'upcoming', false],
            ['Multi-Purpose Health Worker', 'Class 12 (Science) with MPHW training', 150, '18–40 years', '₹21,700 – ₹69,100 (Level 3)', '2026-08-10', '2026-09-10', 'closed', false],
        ];

        return array_map(fn (array $r, int $i) => [
            'id' => $i + 1,
            'advtNo' => sprintf('HFW/REC/2026/%02d', $i + 1),
            'postName' => $r[0],
            'department' => 'Health & Family Welfare Department',
            'vacancies' => $r[2],
            'qualification' => $r[1],
            'ageLimit' => $r[3],
            'payScale' => $r[4],
            'startDate' => $r[5],
            'endDate' => $r[6],
            'status' => $r[7],
            'isNew' => $r[8],
            'pdfUrl' => '#',
        ], $rows, array_keys($rows));
    }

    /**
     * @return list<array<string, mixed>>
     */
    public static function notifications(): array
    {
        $rows = [
            ['Corrigendum: Last date extended for Staff Nurse (Advt. No. HFW/REC/2026/01)', '2026-10-13', 'corrigendum', true],
            ['Admit Card released for Pharmacist Written Exam', '2026-10-12', 'admit_card', true],
            ['Provisional Answer Key published for Laboratory Technician', '2026-10-10', 'answer_key', true],
            ['Advertisement: Medical Officer (General Duty) – 45 posts', '2026-09-20', 'advertisement', false],
            ['Final Result declared for Multi-Purpose Health Worker', '2026-10-06', 'result', false],
            ['Notice: Document verification schedule for Physiotherapist', '2026-10-03', 'notice', false],
            ['Advertisement: Staff Nurse – 120 posts', '2026-10-01', 'advertisement', false],
            ['Result: Dental Surgeon written examination', '2026-09-28', 'result', false],
            ['Notice: Updated photo and signature guidelines', '2026-09-22', 'notice', false],
            ['Corrigendum: Qualification clarified for Radiographer', '2026-09-18', 'corrigendum', false],
        ];

        return array_map(fn (array $r, int $i) => [
            'id' => $i + 1,
            'title' => $r[0],
            'date' => $r[1],
            'type' => $r[2],
            'isNew' => $r[3],
            'url' => '#',
        ], $rows, array_keys($rows));
    }

    /**
     * @return list<array<string, string>>
     */
    public static function importantDates(): array
    {
        return [
            ['label' => 'Application start', 'date' => '2026-10-01'],
            ['label' => 'Application end', 'date' => '2026-10-30'],
            ['label' => 'Last date for fee payment', 'date' => '2026-11-02'],
            ['label' => 'Correction window', 'date' => '2026-11-05'],
            ['label' => 'Admit card release', 'date' => '2026-11-20'],
            ['label' => 'Exam date', 'date' => '2026-12-06'],
        ];
    }

    /**
     * @return array<string, int>
     */
    public static function stats(): array
    {
        return [
            'totalVacancies' => 493,
            'activeRecruitments' => 4,
            'registeredApplicants' => 48215,
            'districtsCovered' => 8,
        ];
    }

    /**
     * @return list<array<string, string>>
     */
    public static function faqs(): array
    {
        return [
            ['id' => 'q1', 'question' => 'How do I register on the portal?', 'answer' => 'Click "Register", fill in your details exactly as in your Class 10 certificate, verify your mobile number and email with OTP, and set a password. Your registration number is shown on completion.'],
            ['id' => 'q2', 'question' => 'What are the photo and signature size rules?', 'answer' => 'Photograph: JPG/JPEG, 20–50 KB, 3.5 cm × 4.5 cm, white background. Signature: JPG/JPEG, 10–20 KB, 3.5 cm × 1.5 cm, signed in black ink on white paper.'],
            ['id' => 'q3', 'question' => 'I forgot my registration number. What should I do?', 'answer' => 'Use "Forgot Password?" and enter your registered mobile number or email. After OTP verification your registration number is sent to your registered contact.'],
            ['id' => 'q4', 'question' => 'Fee payment failed but the amount was deducted.', 'answer' => 'Do not pay again. Failed transactions are reconciled automatically within 3–5 working days and refunded to the source account if the application was not confirmed.'],
            ['id' => 'q5', 'question' => 'Can I edit my application after submission?', 'answer' => 'You may edit only during the correction window announced in the advertisement. Name and date of birth cannot be changed after registration.'],
            ['id' => 'q6', 'question' => 'How do I download my admit card?', 'answer' => 'Log in, open "Admit Card", select the recruitment and download the PDF. Admit cards are released a few days before the examination.'],
            ['id' => 'q7', 'question' => 'What are the helpdesk timings?', 'answer' => 'The helpdesk is available from 10:00 AM to 5:00 PM, Monday to Saturday, except public holidays.'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public static function helpdesk(): array
    {
        return [
            'phone' => '0381-2315 000',
            'email' => 'helpdesk.recruitment@tripura.example.gov.in',
            'hours' => '10:00 AM – 5:00 PM, Mon–Sat, except holidays',
            'address' => 'Directorate of Health Services, Agartala, Tripura – 799001',
        ];
    }

    /**
     * Full notification list (advertisement banners with their download / apply links).
     *
     * @return list<array<string, mixed>>
     */
    public static function notificationEntries(): array
    {
        return array_map(function (array $r) {
            $range = date('d.m.Y', strtotime($r['startDate'])).' to '.date('d.m.Y', strtotime($r['endDate']));
            $links = [
                ['id' => 'ad', 'kind' => 'download', 'label' => 'Download Advertisement', 'meta' => 'English (PDF, 890 KB)', 'isNew' => $r['isNew'], 'url' => '#'],
            ];

            if ($r['status'] !== 'closed') {
                $links[] = ['id' => 'apply', 'kind' => 'apply', 'label' => "Apply Online ({$range})", 'meta' => null, 'isNew' => $r['isNew'], 'url' => '/login'];
            }

            $links[] = ['id' => 'biodata', 'kind' => 'form', 'label' => 'Biodata Form', 'meta' => null, 'isNew' => $r['isNew'], 'url' => '#'];
            $links[] = ['id' => 'declaration', 'kind' => 'form', 'label' => 'Self Declaration Form', 'meta' => null, 'isNew' => false, 'url' => '#'];

            return [
                'id' => $r['id'],
                'title' => 'Recruitment for the post of '.$r['postName'],
                'highlight' => ($r['status'] === 'upcoming' ? 'Apply online from ' : 'Apply online ').$range,
                'advtNo' => $r['advtNo'],
                'status' => $r['status'],
                'lastDate' => $r['endDate'],
                'isNew' => $r['isNew'],
                'links' => $links,
            ];
        }, self::recruitments());
    }

    /**
     * Props shared by every public page (header phone, ticker, footer).
     *
     * @return array<string, mixed>
     */
    public static function shared(): array
    {
        return [
            'helpdesk' => self::helpdesk(),
            'ticker' => array_slice(self::notifications(), 0, 6),
            'siteMeta' => [
                'lastUpdated' => '14 October 2026',
                'visitors' => '1,28,456',
            ],
        ];
    }
}
