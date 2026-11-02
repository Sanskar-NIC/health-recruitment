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
        'results' => 'Results & Selection',
        'notices' => 'Notices',
        'masters/exam-centres' => 'Exam Centres',
        'masters/councils' => 'Professional Councils',
        'profile' => 'My Profile',
    ];
}
