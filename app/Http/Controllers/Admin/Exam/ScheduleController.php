<?php

namespace App\Http\Controllers\Admin\Exam;

use App\Http\Controllers\Controller;
use App\Models\Admin\Recruitment;
use App\Models\Admin\RecruitmentExam;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ScheduleController extends Controller
{
    use Concerns;

    public function index(Request $request): Response
    {
        $recruitment = $this->selected($request);
        $exam = $recruitment ? $this->exam($recruitment) : null;
        $hhmm = fn (?string $t) => $t ? substr($t, 0, 5) : '';

        return Inertia::render('admin/exams/schedule', [
            'recruitments' => $this->recruitments(),
            'recruitment' => $recruitment?->id,
            'schedule' => $exam ? [
                'exam_date' => $exam->exam_date?->toDateString() ?? '',
                'reporting_time' => $hhmm($exam->reporting_time),
                'start_time' => $hhmm($exam->start_time),
                'end_time' => $hhmm($exam->end_time),
                'instructions' => $exam->instructions ?? '',
            ] : null,
        ]);
    }

    public function save(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'recruitment' => ['required', 'integer', 'exists:'.Recruitment::class.',id'],
            'exam_date' => ['required', 'date'],
            'reporting_time' => ['required', 'date_format:H:i'],
            'start_time' => ['required', 'date_format:H:i', 'after:reporting_time'],
            'end_time' => ['required', 'date_format:H:i', 'after:start_time'],
            'instructions' => ['nullable', 'string', 'max:3000'],
        ]);

        $id = $data['recruitment'];
        unset($data['recruitment']);

        RecruitmentExam::updateOrCreate(['recruitment_id' => $id], $data);
        Recruitment::whereKey($id)->update(['exam_date' => $data['exam_date']]);

        return $this->toast('success', 'Exam schedule saved.');
    }
}
