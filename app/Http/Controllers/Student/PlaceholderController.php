<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class PlaceholderController extends Controller
{
    public function __invoke(string $title): Response
    {
        return Inertia::render('student/coming-soon', ['title' => $title]);
    }
}
