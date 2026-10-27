<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Admin\Recruitment;
use App\Models\Student\Application;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ApplicationController extends Controller
{
    private const PER_PAGE = 20;

    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search'));
        $status = (string) $request->query('status');
        $recruitment = (int) $request->query('recruitment');

        $applications = Application::query()
            ->with(['student', 'recruitment', 'post'])
            ->when($search !== '', fn ($q) => $q->where(fn ($w) => $w
                ->where('application_no', 'ilike', "%{$search}%")
                ->orWhereHas('student', fn ($s) => $s
                    ->where('full_name', 'ilike', "%{$search}%")
                    ->orWhere('registration_no', 'ilike', "%{$search}%")
                    ->orWhere('mobile', 'like', "%{$search}%"))
                ->orWhereHas('recruitment', fn ($r) => $r->where('advt_no', 'ilike', "%{$search}%"))))
            ->when(in_array($status, [Application::SUBMITTED, Application::WITHDRAWN, Application::REJECTED], true), fn ($q) => $q->where('status', $status))
            ->when($recruitment > 0, fn ($q) => $q->where('recruitment_id', $recruitment))
            ->latest('submitted_at')
            ->latest('id')
            ->paginate(self::PER_PAGE)
            ->withQueryString();

        return Inertia::render('admin/applications/index', [
            'applications' => $applications->getCollection()->map(fn (Application $a) => $this->row($a))->values(),
            'meta' => [
                'page' => $applications->currentPage(),
                'last_page' => $applications->lastPage(),
                'total' => $applications->total(),
            ],
            'filters' => ['search' => $search, 'status' => $status, 'recruitment' => $recruitment ?: ''],
            'recruitments' => Recruitment::query()->orderByDesc('id')->get(['id', 'advt_no'])
                ->map(fn ($r) => ['id' => $r->id, 'advt_no' => $r->advt_no]),
        ]);
    }

    public function show(int $application): Response
    {
        $model = Application::with(['student.profile', 'recruitment', 'post'])->findOrFail($application);
        $snapshot = (array) $model->snapshot;
        $documents = $this->documents($model);

        return Inertia::render('admin/applications/show', [
            'application' => $this->row($model) + [
                'feeAmount' => (float) $model->fee_amount,
                'feeStatus' => $model->fee_status,
                'rejectionReason' => $model->rejection_reason,
                'rejectedAt' => $model->rejected_at?->toIso8601String(),
                'withdrawnAt' => $model->withdrawn_at?->toIso8601String(),
                'postCode' => $model->post->code,
                'candidate' => [
                    'name' => $model->student->full_name,
                    'dob' => $model->student->dob?->toDateString(),
                    'gender' => $model->student->gender,
                    'email' => $model->student->email,
                ],
                'profile' => $this->profile($model),
                'checks' => $snapshot['checks'] ?? [],
                'documents' => $documents,
                'photo' => collect($documents)->firstWhere('key', 'photo')['url'] ?? null,
            ],
        ]);
    }

    public function reject(Request $request, int $application): RedirectResponse
    {
        $model = Application::findOrFail($application);

        abort_unless($model->isActive(), 403);

        $data = $request->validate(['reason' => ['required', 'string', 'min:10', 'max:1000']]);

        $model->update([
            'status' => Application::REJECTED,
            'rejection_reason' => $data['reason'],
            'rejected_at' => now(),
            'rejected_by' => $request->user('admin')->id,
        ]);

        return back()->with('success', 'Application rejected.');
    }

    /** Streams one of the candidate's submitted documents; only paths found on the application are served. */
    public function file(Request $request, int $application): StreamedResponse
    {
        $model = Application::with('student.profile')->findOrFail($application);
        $path = (string) $request->query('path');

        abort_unless(collect($this->documents($model))->contains('path', $path), 404);

        return Storage::disk('local')->response($path);
    }

    /** The profile exactly as submitted; older applications fall back to the live profile. */
    private function profile(Application $a): array
    {
        $live = $a->student->profile;

        return ((array) $a->snapshot)['profile'] ?? [
            'personal' => (array) $live?->personal,
            'address' => (array) $live?->address,
            'other_details' => (array) $live?->other_details,
            'experience' => (array) $live?->experience,
            'qualifications' => (array) $live?->qualifications,
        ];
    }

    /** @return list<array{key: string, label: string, name: string, size: int|null, kind: string, path: string, url: string}> */
    private function documents(Application $a): array
    {
        $profile = $this->profile($a);
        $uploads = (array) $a->student->profile?->uploads;
        $dir = "profiles/{$a->student_id}/";
        $found = [];

        $add = function (string $key, string $label, mixed $ref) use (&$found, $dir, $a) {
            $path = is_array($ref) ? (string) ($ref['path'] ?? '') : '';

            if (! str_starts_with($path, $dir) || str_contains($path, '..') || ! Storage::disk('local')->exists($path)) {
                return;
            }

            $found[] = [
                'key' => $key,
                'label' => $label,
                'name' => (string) ($ref['name'] ?? basename($path)),
                'size' => isset($ref['size']) ? (int) $ref['size'] : null,
                'kind' => strtolower(pathinfo($path, PATHINFO_EXTENSION)) === 'pdf' ? 'pdf' : 'image',
                'path' => $path,
                'url' => "/admin/applications/{$a->id}/file?".http_build_query(['path' => $path]),
            ];
        };

        $add('photo', 'Photograph', $uploads['photo'] ?? null);
        $add('signature', 'Signature', $uploads['signature'] ?? null);

        foreach (['personal', 'other_details'] as $section) {
            foreach ((array) ($profile[$section] ?? []) as $k => $v) {
                if (is_array($v)) {
                    $add($k, ucfirst(str_replace('_', ' ', $k)), $v);
                }
            }
        }

        foreach ((array) ($profile['qualifications'] ?? []) as $i => $q) {
            $add("qualification-$i", ($q['type'] ?? 'Qualification').' certificate', $q['document'] ?? null);
        }

        foreach ((array) ($profile['experience']['entries'] ?? []) as $i => $e) {
            $add("experience-$i", ($e['employer'] ?? 'Experience').' – experience certificate', $e['document'] ?? null);
        }

        return $found;
    }

    /** @return array<string, mixed> */
    private function row(Application $a): array
    {
        return [
            'id' => $a->id,
            'applicationNo' => $a->application_no,
            'status' => $a->status,
            'category' => $a->category,
            'submittedAt' => $a->submitted_at?->toIso8601String(),
            'candidateName' => $a->student->full_name,
            'registrationNo' => $a->student->registration_no,
            'mobile' => $a->student->mobile,
            'recruitmentId' => $a->recruitment_id,
            'advtNo' => $a->recruitment->advt_no,
            'title' => $a->recruitment->title,
            'postName' => $a->post->name,
        ];
    }
}
