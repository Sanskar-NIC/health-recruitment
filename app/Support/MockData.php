<?php

namespace App\Support;

/**
 * Public-portal data. Recruitments, notices, dates and stats come from the admin-managed
 * database via PublicFeed; FAQs and helpdesk details are still static.
 */
class MockData
{
    /**
     * Published recruitments (from the admin portal).
     *
     * @return list<array<string, mixed>>
     */
    public static function recruitments(): array
    {
        return PublicFeed::recruitments();
    }

    /**
     * Notices derived from published recruitments and their corrigenda.
     *
     * @return list<array<string, mixed>>
     */
    public static function notifications(): array
    {
        return PublicFeed::notifications();
    }

    /**
     * Timeline of the featured recruitment.
     *
     * @return list<array<string, string>>
     */
    public static function importantDates(): array
    {
        return PublicFeed::importantDates();
    }

    /**
     * @return array<string, int>
     */
    public static function stats(): array
    {
        return PublicFeed::stats();
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
