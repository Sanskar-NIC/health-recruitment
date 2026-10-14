<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the student dashboard (login-only).
     */
    public function __invoke(Request $request): Response
    {
        $student = $request->user('student');

        return Inertia::render('student/dashboard', [
            'student' => $student,
        ]);
    }
}
