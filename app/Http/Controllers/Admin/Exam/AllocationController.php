<?php

namespace App\Http\Controllers\Admin\Exam;

use App\Http\Controllers\Controller;
use App\Models\Admin\ExamCentre;
use App\Models\Admin\Recruitment;
use App\Models\Student\Application;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

/** Assigns shortlisted candidates to exam centres and issues their roll numbers. */
class AllocationController extends Controller
{
    use Concerns;

    public function index(Request $request): Response
    {
        $recruitment = $this->selected($request);
        $candidates = $recruitment ? $this->shortlisted($recruitment->id)->with(['student', 'post'])->orderBy('id')->get() : collect();
        $counts = $candidates->whereNotNull('exam_centre_id')->countBy('exam_centre_id');

        return Inertia::render('admin/exams/centres', [
            'recruitments' => $this->recruitments(),
            'recruitment' => $recruitment?->id,
            'released' => $recruitment ? (bool) $this->exam($recruitment)->admit_cards_released_at : false,
            'centres' => ExamCentre::query()->where('is_active', true)->orderBy('city')->orderBy('name')->get()
                ->map(fn ($c) => [
                    'id' => $c->id, 'name' => $c->name, 'code' => $c->code, 'city' => $c->city,
                    'capacity' => $c->capacity, 'allocated' => (int) ($counts[$c->id] ?? 0),
                ])->values(),
            'candidates' => $candidates->map(fn (Application $a) => [
                'id' => $a->id,
                'applicationNo' => $a->application_no,
                'name' => $a->student->full_name,
                'registrationNo' => $a->student->registration_no,
                'postName' => $a->post->name,
                'rollNo' => $a->roll_no,
                'centreId' => $a->exam_centre_id,
            ])->values(),
        ]);
    }

    /** Fills the chosen centres in order, up to each one's capacity, for everyone not yet allocated. */
    public function auto(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'recruitment' => ['required', 'integer', 'exists:'.Recruitment::class.',id'],
            'centre_ids' => ['required', 'array', 'min:1'],
            'centre_ids.*' => ['integer'],
        ]);

        [$placed, $left] = DB::transaction(function () use ($data) {
            $pending = $this->shortlisted($data['recruitment'])->whereNull('exam_centre_id')->orderBy('id')->lockForUpdate()->get();
            $placed = 0;

            foreach ($data['centre_ids'] as $centreId) {
                $centre = ExamCentre::where('is_active', true)->find($centreId);

                if (! $centre) {
                    continue;
                }

                $free = $centre->capacity - $this->shortlisted($data['recruitment'])->where('exam_centre_id', $centre->id)->count();

                foreach ($pending->splice(0, max($free, 0)) as $application) {
                    $this->place($application, $centre->id);
                    $placed++;
                }
            }

            return [$placed, $pending->count()];
        });

        return $this->toast($left ? 'error' : 'success', $left
            ? "{$placed} allocated; {$left} still have no centre because the selected centres are full."
            : "{$placed} candidate(s) allocated.");
    }

    /** Moves the given candidates to one centre, or clears their centre when none is given. */
    public function assign(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'recruitment' => ['required', 'integer', 'exists:'.Recruitment::class.',id'],
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer'],
            'centre_id' => ['nullable', 'integer'],
        ]);

        $error = DB::transaction(function () use ($data): ?string {
            $applications = $this->shortlisted($data['recruitment'])->whereIn('id', $data['ids'])->lockForUpdate()->get();

            if (! $data['centre_id']) {
                $applications->each->update(['exam_centre_id' => null]);

                return null;
            }

            $centre = ExamCentre::where('is_active', true)->findOrFail($data['centre_id']);
            $taken = $this->shortlisted($data['recruitment'])->where('exam_centre_id', $centre->id)->whereNotIn('id', $data['ids'])->count();

            if ($taken + $applications->count() > $centre->capacity) {
                return "{$centre->name} has only ".max($centre->capacity - $taken, 0).' seat(s) left.';
            }

            $applications->each(fn ($a) => $this->place($a, $centre->id));

            return null;
        });

        return $error ? $this->toast('error', $error) : $this->toast('success', 'Allocation updated.');
    }

    private function shortlisted(int $recruitmentId): Builder
    {
        return Application::query()->where('recruitment_id', $recruitmentId)
            ->where('status', Application::SUBMITTED)->whereNotNull('shortlisted_at');
    }

    private function place(Application $application, int $centreId): void
    {
        $application->update(['exam_centre_id' => $centreId, 'roll_no' => $application->roll_no ?? $this->nextRoll($application->recruitment_id)]);
    }

    /** HR{recruitment}{serial}, e.g. HR00100042; the serial continues from the highest one issued. */
    private function nextRoll(int $recruitmentId): string
    {
        $last = Application::where('recruitment_id', $recruitmentId)->whereNotNull('roll_no')->pluck('roll_no')
            ->map(fn ($r) => (int) substr($r, -5))->max() ?? 0;

        return sprintf('HR%03d%05d', $recruitmentId, $last + 1);
    }
}
