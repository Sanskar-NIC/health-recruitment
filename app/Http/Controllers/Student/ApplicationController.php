<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Admin\Recruitment;
use App\Models\Admin\RecruitmentPost;
use App\Models\Student\Application;
use App\Models\Student\Registration;
use App\Support\PublicFeed;
use App\Support\Student\ApplicationEligibility;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class ApplicationController extends Controller
{
    /** The candidate's applications, newest first. */
    public function index(Request $request): Response
    {
        $applications = $this->student($request)->applications()
            ->with(['recruitment', 'post'])
            ->latest('id')
            ->get()
            ->map(fn (Application $a) => $this->present($a));

        return Inertia::render('student/applications', ['applications' => $applications]);
    }

    /** Review step: eligibility checks, fee and declaration before the candidate submits. */
    public function create(Request $request, int $recruitment, int $post): Response|RedirectResponse
    {
        [$student, $recruitment, $post] = $this->resolve($request, $recruitment, $post);

        $existing = ApplicationEligibility::existing($student, $post);

        if ($existing?->isActive()) {
            return redirect()->route('student.applications.show', $existing);
        }

        if ($existing?->status === Application::REJECTED) {
            return redirect()->route('student.applications.index')->with('error', 'Your application for this post was rejected and cannot be resubmitted.');
        }

        $detail = PublicFeed::detail($recruitment);

        return Inertia::render('student/apply', [
            'recruitment' => $detail,
            'post' => collect($detail['posts'])->firstWhere('id', $post->id),
            'eligibility' => ApplicationEligibility::evaluate($student, $recruitment, $post),
            'fee' => ApplicationEligibility::fee($student, $recruitment),
            'candidate' => [
                'name' => $student->full_name,
                'registrationNo' => $student->registration_no,
                'dob' => $student->dob->toDateString(),
                'gender' => $student->gender,
                'category' => $student->category,
                'mobile' => $student->mobile,
                'email' => $student->email,
            ],
        ]);
    }

    public function store(Request $request, int $recruitment, int $post): RedirectResponse
    {
        [$student, $recruitment, $post] = $this->resolve($request, $recruitment, $post);

        $request->validate([
            'declaration' => ['accepted'],
            'qualification' => ['accepted'],
        ], [
            'declaration.accepted' => 'You must accept the declaration to submit your application.',
            'qualification.accepted' => 'Please confirm that you meet the minimum qualification.',
        ]);

        $evaluation = ApplicationEligibility::evaluate($student, $recruitment, $post);

        if (! $evaluation['eligible']) {
            throw ValidationException::withMessages(['eligibility' => 'You are not eligible to apply for this post.']);
        }

        $existing = ApplicationEligibility::existing($student, $post);

        if ($existing?->isActive()) {
            return redirect()->route('student.applications.show', $existing);
        }

        if ($existing?->status === Application::REJECTED) {
            throw ValidationException::withMessages(['eligibility' => 'Your application for this post was rejected and cannot be resubmitted.']);
        }

        $fee = ApplicationEligibility::fee($student, $recruitment);
        $values = [
            'application_no' => $existing?->application_no ?? Application::numberFor($student),
            'status' => Application::SUBMITTED,
            'category' => $student->category,
            'fee_amount' => $fee,
            // Online payment is not wired up yet, so a fee stays "pending" until it is recorded.
            'fee_status' => $fee > 0 ? 'pending' : 'not_required',
            'snapshot' => ApplicationEligibility::snapshot($student, $evaluation),
            'submitted_at' => now(),
            'withdrawn_at' => null,
        ];

        // Re-applying after a withdrawal revives the same row.
        $application = $existing
            ? tap($existing)->update($values)
            : Application::create($values + [
                'student_id' => $student->id,
                'recruitment_id' => $recruitment->id,
                'recruitment_post_id' => $post->id,
            ]);

        return redirect()->route('student.applications.show', $application)
            ->with('success', 'Your application has been submitted.');
    }

    public function show(Request $request, int $application): Response
    {
        $model = $this->student($request)->applications()->with(['recruitment', 'post'])->findOrFail($application);

        return Inertia::render('student/application-show', [
            'application' => $this->present($model) + [
                'snapshot' => $model->snapshot,
                'dates' => PublicFeed::datesFor($model->recruitment),
            ],
        ]);
    }

    /** The full application form as a PDF, built from what the candidate submitted. */
    public function download(Request $request, int $application)
    {
        $student = $this->student($request);
        $model = $student->applications()->with(['recruitment', 'post'])->findOrFail($application);
        $snapshot = (array) $model->snapshot;
        // Applications made before the full snapshot existed fall back to the live profile.
        $profile = $snapshot['profile'] ?? [
            'personal' => (array) $student->profile?->personal,
            'address' => (array) $student->profile?->address,
            'other_details' => (array) $student->profile?->other_details,
            'experience' => (array) $student->profile?->experience,
            'qualifications' => (array) $student->profile?->qualifications,
        ];
        $uploads = (array) $student->profile?->uploads;

        return Pdf::loadView('pdf.application-form', [
            'application' => $model,
            'recruitment' => $model->recruitment,
            'post' => $model->post,
            'student' => $student,
            'profile' => $profile,
            'dates' => PublicFeed::datesFor($model->recruitment),
            'photo' => $this->embed($uploads['photo']['path'] ?? null),
            'signature' => $this->embed($uploads['signature']['path'] ?? null),
        ])->setPaper('a4')->download("application-{$model->application_no}.pdf");
    }

    private function embed(?string $path): ?string
    {
        $disk = Storage::disk('local');

        if (! $path || str_contains($path, '..') || ! $disk->exists($path)) {
            return null;
        }

        return 'data:'.$disk->mimeType($path).';base64,'.base64_encode($disk->get($path));
    }

    /** Candidates may withdraw only while applications are still open. */
    public function withdraw(Request $request, int $application): RedirectResponse
    {
        $model = $this->student($request)->applications()->with('recruitment')->findOrFail($application);

        abort_unless($this->canWithdraw($model), 403);

        $model->update(['status' => Application::WITHDRAWN, 'withdrawn_at' => now()]);

        return redirect()->route('student.applications.index')->with('success', 'Application withdrawn.');
    }

    /** @return array{0: Registration, 1: Recruitment, 2: RecruitmentPost} */
    private function resolve(Request $request, int $recruitmentId, int $postId): array
    {
        $recruitment = Recruitment::query()->visibleToPublic()->with('posts')->findOrFail($recruitmentId);
        $post = $recruitment->posts->firstWhere('id', $postId) ?? abort(404);

        return [$this->student($request), $recruitment, $post];
    }

    private function student(Request $request): Registration
    {
        return $request->user('student')->loadMissing('profile');
    }

    private function canWithdraw(Application $a): bool
    {
        return $a->isActive() && in_array($a->recruitment->displayStatus(), ['open', 'closing_soon'], true);
    }

    /** @return array<string, mixed> */
    private function present(Application $a): array
    {
        return [
            'id' => $a->id,
            'applicationNo' => $a->application_no,
            'status' => $a->status,
            'category' => $a->category,
            'feeAmount' => (float) $a->fee_amount,
            'feeStatus' => $a->fee_status,
            'submittedAt' => $a->submitted_at?->toIso8601String(),
            'recruitmentId' => $a->recruitment_id,
            'advtNo' => $a->recruitment->advt_no,
            'title' => $a->recruitment->title,
            'postName' => $a->post->name,
            'recruitmentStatus' => $a->recruitment->displayStatus(),
            'lastDate' => $a->recruitment->app_end?->format('Y-m-d'),
            'rejectionReason' => $a->status === Application::REJECTED ? $a->rejection_reason : null,
            'canWithdraw' => $this->canWithdraw($a),
        ];
    }
}
