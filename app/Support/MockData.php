<?php

namespace App\Support;

/**
 * Public-portal data. Recruitments, notices, dates and stats come from the admin-managed
 * database via PublicFeed; helpdesk details are still static.
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
