<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Support\MockData;
use Inertia\Inertia;
use Inertia\Response;

class RecruitmentController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('student/recruitments', [
            'recruitments' => MockData::recruitments(),
        ]);
    }
}
