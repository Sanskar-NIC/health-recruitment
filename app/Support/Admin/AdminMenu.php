<?php

namespace App\Support\Admin;

/**
 * Admin sections that are still placeholder pages.
 * Key = URL path under /admin, value = page title.
 */
class AdminMenu
{
    public const SECTIONS = [
        'exams/schedule' => 'Exam Schedule',
        'exams/centres' => 'Centres & Allocation',
        'exams/admit-cards' => 'Admit Cards',
        'answer-keys' => 'Answer Keys & Objections',
        'results' => 'Results & Selection',
        'notices' => 'Notices',
        'website-content' => 'Website Content',
        'communication' => 'Communication',
        'grievances' => 'Grievances',
        'reports' => 'Reports',
        'masters/exam-centres' => 'Exam Centres',
        'masters/councils' => 'Professional Councils',
        'profile' => 'My Profile',
        'activity-log' => 'Activity Log',
    ];
}
