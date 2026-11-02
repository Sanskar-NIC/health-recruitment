<?php

namespace App\Http\Controllers\Admin\Exam;

use App\Http\Controllers\Controller;
use App\Models\Admin\Recruitment;
use App\Models\Student\Application;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/** Marks which applicants, after the department's manual scrutiny, are called for the written exam. */
class ShortlistController extends Controller
{
    use Concerns;

    public function index(Request $request): Response
    {
        $recruitment = $this->selected($request);

        $applications = $recruitment
            ? Application::query()->with(['student', 'post'])
                ->where('recruitment_id', $recruitment->id)->where('status', Application::SUBMITTED)
                ->orderBy('id')->get()
                ->map(fn (Application $a) => [
                    'id' => $a->id,
                    'applicationNo' => $a->application_no,
                    'name' => $a->student->full_name,
                    'registrationNo' => $a->student->registration_no,
                    'mobile' => $a->student->mobile,
                    'email' => $a->student->email,
                    'postName' => $a->post->name,
                    'category' => $a->category,
                    'shortlisted' => (bool) $a->shortlisted_at,
                ])->values()
            : [];

        return Inertia::render('admin/exams/shortlisting', [
            'recruitments' => $this->recruitments(),
            'recruitment' => $recruitment?->id,
            'applications' => $applications,
            'locked' => $recruitment ? (bool) $this->exam($recruitment)->results_published_at : false,
        ]);
    }

    /** Replaces the shortlist: ticked applications are in, every other active application is out. */
    public function save(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'recruitment' => ['required', 'integer', 'exists:'.Recruitment::class.',id'],
            'ids' => ['array'],
            'ids.*' => ['integer'],
        ]);

        abort_if($this->exam(Recruitment::findOrFail($data['recruitment']))->results_published_at, 403);

        $active = Application::where('recruitment_id', $data['recruitment'])->where('status', Application::SUBMITTED);
        $ids = array_map('intval', $data['ids'] ?? []);

        (clone $active)->whereIn('id', $ids)->whereNull('shortlisted_at')->update(['shortlisted_at' => now()]);

        // Dropping someone from the shortlist also drops their centre, roll number and marks.
        (clone $active)->whereNotIn('id', $ids)->whereNotNull('shortlisted_at')->update([
            'shortlisted_at' => null, 'exam_centre_id' => null, 'roll_no' => null,
            'marks_obtained' => null, 'marks_total' => null, 'is_selected' => false,
        ]);

        return $this->toast('success', count($ids).' candidate(s) shortlisted for the written exam.');
    }
}
