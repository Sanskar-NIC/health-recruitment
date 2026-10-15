<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        // Real figures arrive with each module; until then everything is zero/empty.
        return Inertia::render('admin/dashboard', [
            'stats' => [
                'activeRecruitments' => 0,
                'totalApplications' => 0,
                'todayApplications' => 0,
                'pendingScrutiny' => 0,
                'openGrievances' => 0,
            ],
            'deadlines' => [],
            'pendingTasks' => [],
            'activity' => [],
            'previousLogin' => $request->session()->get('admin_previous_login'),
        ]);
    }
}
