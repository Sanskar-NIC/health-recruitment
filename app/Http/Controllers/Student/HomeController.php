<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Support\MockData;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function index(Request $request): Response|RedirectResponse
    {
        // The landing page is for visitors; logged-in applicants use their dashboard.
        if ($request->user('student')) {
            return redirect()->route('student.dashboard');
        }

        $recruitments = MockData::recruitments();

        return Inertia::render('student/home', [
            'recruitments' => $recruitments,
            'notifications' => MockData::notifications(),
            'importantDates' => MockData::importantDates(),
            'featuredRecruitment' => $recruitments[0],
            'stats' => MockData::stats(),
            'faqs' => MockData::faqs(),
        ]);
    }
}
