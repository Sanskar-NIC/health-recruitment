<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Support\MockData;
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
            // Applications/admit cards are not built yet, so they are reported as zero.
            'stats' => [
                'current' => count(array_filter(MockData::recruitments(), fn ($r) => in_array($r['status'], ['open', 'closing_soon'], true))),
                'applied' => $student->applications()->where('status', 'submitted')->count(),
                'admitCards' => 0,
            ],
            'recruitments' => array_values(array_filter(
                MockData::recruitments(),
                fn ($r) => in_array($r['status'], ['open', 'closing_soon'], true),
            )),
        ]);
    }
}
