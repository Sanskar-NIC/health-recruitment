<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Support\Admin\AdminMenu;
use Inertia\Inertia;
use Inertia\Response;

class SectionController extends Controller
{
    /** Placeholder page for admin modules that are not built yet. */
    public function __invoke(string $section): Response
    {
        abort_unless(isset(AdminMenu::SECTIONS[$section]), 404);

        return Inertia::render('admin/section', ['title' => AdminMenu::SECTIONS[$section]]);
    }
}
