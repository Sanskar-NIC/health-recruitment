<?php

namespace App\Http\Controllers\Admin\Exam;

use App\Http\Controllers\Controller;
use App\Models\Admin\Recruitment;
use App\Models\Admin\RecruitmentExam;
use App\Models\Student\Application;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

/** Records marks and the final selected list sent by the department, then publishes it to candidates. */
class ResultController extends Controller
{
    use Concerns;

    public function index(Request $request): Response
    {
        $recruitment = $this->selected($request);
        $exam = $recruitment ? $this->exam($recruitment) : null;

        $candidates = $recruitment
            ? $this->shortlisted($recruitment->id)->with(['student', 'post'])->orderBy('roll_no')->orderBy('id')->get()
                ->map(fn (Application $a) => [
                    'id' => $a->id,
                    'applicationNo' => $a->application_no,
                    'name' => $a->student->full_name,
                    'registrationNo' => $a->student->registration_no,
                    'rollNo' => $a->roll_no,
                    'postName' => $a->post->name,
                    'marksObtained' => $a->marks_obtained !== null ? (float) $a->marks_obtained : null,
                    'marksTotal' => $a->marks_total !== null ? (float) $a->marks_total : null,
                    'selected' => $a->is_selected,
                ])->values()
            : [];

        return Inertia::render('admin/results', [
            'recruitments' => $this->recruitments(),
            'recruitment' => $recruitment?->id,
            'publishedAt' => $exam?->results_published_at?->toIso8601String(),
            'candidates' => $candidates,
        ]);
    }

    public function save(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'recruitment' => ['required', 'integer', 'exists:'.Recruitment::class.',id'],
            'rows' => ['required', 'array'],
            'rows.*.id' => ['required', 'integer'],
            'rows.*.selected' => ['required', 'boolean'],
            'rows.*.marks_obtained' => ['nullable', 'numeric', 'min:0', 'max:100000'],
            'rows.*.marks_total' => ['nullable', 'numeric', 'gt:0', 'max:100000'],
        ]);

        foreach ($data['rows'] as $row) {
            if (! $row['selected']) {
                continue;
            }

            if (($row['marks_obtained'] ?? null) === null || ($row['marks_total'] ?? null) === null) {
                return $this->toast('error', 'Every selected candidate needs marks obtained and marks out of.');
            }

            if ((float) $row['marks_obtained'] > (float) $row['marks_total']) {
                return $this->toast('error', 'Marks obtained cannot be more than marks out of.');
            }
        }

        DB::transaction(function () use ($data) {
            $applications = $this->shortlisted($data['recruitment'])->whereIn('id', collect($data['rows'])->pluck('id'))->get()->keyBy('id');

            foreach ($data['rows'] as $row) {
                $applications->get($row['id'])?->update([
                    'is_selected' => $row['selected'],
                    'marks_obtained' => $row['marks_obtained'] ?? null,
                    'marks_total' => $row['marks_total'] ?? null,
                ]);
            }
        });

        return $this->toast('success', 'Results saved. Candidates see nothing until you publish.');
    }

    public function publish(Request $request): RedirectResponse
    {
        $id = (int) $request->validate(['recruitment' => ['required', 'integer', 'exists:'.Recruitment::class.',id']])['recruitment'];

        if (! $this->shortlisted($id)->where('is_selected', true)->exists()) {
            return $this->toast('error', 'Save at least one selected candidate before publishing.');
        }

        RecruitmentExam::forRecruitment($id)->fill(['results_published_at' => now()])->save();

        return $this->toast('success', 'Results published. Candidates can now see them.');
    }

    public function unpublish(Request $request): RedirectResponse
    {
        $id = (int) $request->validate(['recruitment' => ['required', 'integer', 'exists:'.Recruitment::class.',id']])['recruitment'];

        RecruitmentExam::where('recruitment_id', $id)->update(['results_published_at' => null]);

        return $this->toast('success', 'Results withdrawn from candidates.');
    }

    private function shortlisted(int $recruitmentId): Builder
    {
        return Application::query()->where('recruitment_id', $recruitmentId)
            ->where('status', Application::SUBMITTED)->whereNotNull('shortlisted_at');
    }
}
