<?php

namespace App\Http\Controllers\Admin\Exam;

use App\Http\Controllers\Controller;
use App\Models\Admin\Recruitment;
use App\Models\Admin\RecruitmentExam;
use App\Models\Student\Application;
use App\Support\AdmitCard;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdmitCardController extends Controller
{
    use Concerns;

    public function index(Request $request): Response
    {
        $recruitment = $this->selected($request);
        $exam = $recruitment ? $this->exam($recruitment) : null;

        $candidates = $recruitment
            ? Application::query()->with(['student', 'examCentre'])
                ->where('recruitment_id', $recruitment->id)->where('status', Application::SUBMITTED)->whereNotNull('shortlisted_at')
                ->orderBy('id')->get()
            : collect();

        return Inertia::render('admin/exams/admit-cards', [
            'recruitments' => $this->recruitments(),
            'recruitment' => $recruitment?->id,
            'scheduleSet' => $exam?->hasSchedule() ?? false,
            'releasedAt' => $exam?->admit_cards_released_at?->toIso8601String(),
            'shortlisted' => $candidates->count(),
            'allocated' => $candidates->whereNotNull('exam_centre_id')->count(),
            'candidates' => $candidates->whereNotNull('exam_centre_id')->map(fn (Application $a) => [
                'id' => $a->id,
                'name' => $a->student->full_name,
                'registrationNo' => $a->student->registration_no,
                'rollNo' => $a->roll_no,
                'centre' => $a->examCentre?->name,
            ])->values(),
        ]);
    }

    public function release(Request $request): RedirectResponse
    {
        $id = (int) $request->validate(['recruitment' => ['required', 'integer', 'exists:'.Recruitment::class.',id']])['recruitment'];
        $exam = RecruitmentExam::forRecruitment($id);

        if (! $exam->hasSchedule()) {
            return $this->toast('error', 'Set the exam schedule before releasing admit cards.');
        }

        $pending = Application::where('recruitment_id', $id)->where('status', Application::SUBMITTED)
            ->whereNotNull('shortlisted_at')->whereNull('exam_centre_id')->count();

        if ($pending > 0) {
            return $this->toast('error', "{$pending} shortlisted candidate(s) have no exam centre yet. Allocate them first.");
        }

        $exam->fill(['admit_cards_released_at' => now()])->save();

        return $this->toast('success', 'Admit cards released. Candidates can now download them.');
    }

    public function withdraw(Request $request): RedirectResponse
    {
        $id = (int) $request->validate(['recruitment' => ['required', 'integer', 'exists:'.Recruitment::class.',id']])['recruitment'];

        RecruitmentExam::where('recruitment_id', $id)->update(['admit_cards_released_at' => null]);

        return $this->toast('success', 'Admit cards withdrawn from candidates.');
    }

    /** Lets the department preview the card exactly as the candidate will download it. */
    public function pdf(int $application)
    {
        $model = Application::with(['student.profile', 'recruitment', 'post', 'examCentre', 'exam'])->whereNotNull('exam_centre_id')->findOrFail($application);

        return AdmitCard::pdf($model)->stream("admit-card-{$model->roll_no}.pdf");
    }
}
