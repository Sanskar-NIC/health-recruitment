<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Admin\Exam\Concerns;
use App\Http\Controllers\Controller;
use App\Models\Admin\ExamCentre;
use App\Models\Student\Application;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ExamCentreController extends Controller
{
    use Concerns;

    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search'));

        $centres = ExamCentre::query()
            ->when($search !== '', fn ($q) => $q->where(fn ($w) => $w
                ->where('name', 'ilike', "%{$search}%")->orWhere('code', 'ilike', "%{$search}%")->orWhere('city', 'ilike', "%{$search}%")))
            ->orderBy('city')->orderBy('name')
            ->paginate(20)->withQueryString();

        return Inertia::render('admin/masters/exam-centres', [
            'centres' => $centres,
            'filters' => ['search' => $search],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        ExamCentre::create($this->validated($request));

        return $this->toast('success', 'Exam centre added.');
    }

    public function update(Request $request, int $centre): RedirectResponse
    {
        $model = ExamCentre::findOrFail($centre);
        $model->update($this->validated($request, $model));

        return $this->toast('success', 'Exam centre updated.');
    }

    public function toggle(int $centre): RedirectResponse
    {
        $model = ExamCentre::findOrFail($centre);
        $model->update(['is_active' => ! $model->is_active]);

        return back();
    }

    public function destroy(int $centre): RedirectResponse
    {
        $model = ExamCentre::findOrFail($centre);

        if (Application::where('exam_centre_id', $model->id)->exists()) {
            return $this->toast('error', 'Candidates are allocated to this centre. Disable it instead of deleting.');
        }

        $model->delete();

        return $this->toast('success', 'Exam centre deleted.');
    }

    /** @return array<string, mixed> */
    private function validated(Request $request, ?ExamCentre $centre = null): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'code' => ['required', 'string', 'max:20', Rule::unique(ExamCentre::class, 'code')->ignore($centre?->id)],
            'address' => ['required', 'string', 'max:500'],
            'city' => ['required', 'string', 'max:100'],
            'capacity' => ['required', 'integer', 'min:1', 'max:100000'],
            'is_active' => ['boolean'],
        ]);
    }
}
