<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Admin\Recruitment;
use App\Support\MockData;
use App\Support\PublicFeed;
use Illuminate\Http\Request;
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

    /** Public advertisement page: notice, posts, eligibility, fees, documents and dates. */
    public function show(Request $request, int $recruitment): Response
    {
        $model = Recruitment::query()->visibleToPublic()->with('posts')->findOrFail($recruitment);
        $student = $request->user('student');

        return Inertia::render('student/recruitment-show', [
            'recruitment' => PublicFeed::detail($model),
            // post id => application id, for posts this candidate has already applied to.
            'applied' => $student
                ? $student->applications()->where('recruitment_id', $model->id)->where('status', 'submitted')
                    ->pluck('id', 'recruitment_post_id')
                : (object) [],
            'profileComplete' => $student ? $student->profile()->where('status', 'completed')->exists() : null,
        ]);
    }
}
