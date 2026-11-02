<?php

namespace App\Support\Admin;

/**
 * Admin sections that are still placeholder pages.
 * Key = URL path under /admin, value = page title.
 */
class AdminMenu
{
    public const SECTIONS = [
        'notices' => 'Notices',
        'masters/councils' => 'Professional Councils',
        'profile' => 'My Profile',
    ];
}
