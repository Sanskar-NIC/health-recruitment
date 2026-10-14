<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Support\MockData;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function index(): Response
    {
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
