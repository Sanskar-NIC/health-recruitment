<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Support\MockData;
use App\Support\PublicFeed;
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

        $recruitments = PublicFeed::recruitments();
        $featured = PublicFeed::featured();

        return Inertia::render('student/home', [
            'recruitments' => $recruitments,
            'notifications' => MockData::notifications(),
            'importantDates' => PublicFeed::importantDates($featured),
            'featuredRecruitment' => $featured,
            'stats' => MockData::stats(),
            'faqs' => MockData::faqs(),
        ]);
    }
}
