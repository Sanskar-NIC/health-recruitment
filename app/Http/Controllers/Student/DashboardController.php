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
            // Latest applications drive the status tracker on the dashboard.
            'applications' => $student->applications()
                ->with(['recruitment:id,advt_no', 'post:id,name'])
                ->latest('submitted_at')
                ->limit(4)
                ->get()
                ->map(fn ($a) => [
                    'id' => $a->id,
                    'applicationNo' => $a->application_no,
                    'advtNo' => $a->recruitment?->advt_no,
                    'postName' => $a->post?->name,
                    'status' => $a->status,
                    'submittedAt' => $a->submitted_at?->toDateString(),
                    'closedAt' => ($a->rejected_at ?? $a->withdrawn_at)?->toDateString(),
                ])
                ->values(),
            'recruitments' => array_values(array_filter(
                MockData::recruitments(),
                fn ($r) => in_array($r['status'], ['open', 'closing_soon'], true),
            )),
        ]);
    }
}
