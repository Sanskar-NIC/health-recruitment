<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Student\Profile;
use App\Models\Student\Registration;
use App\Support\Student\ProfileOptions;
use App\Support\Student\ProfileRules;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ProfileController extends Controller
{
    /** Render the profile wizard with whatever draft exists. */
    public function show(Request $request): Response
    {
        $student = $this->student($request);
        $profile = $student->profile;

        return Inertia::render('student/profile', [
            'profile' => $this->present($student, $profile),
            'options' => ProfileOptions::forClient(),
            'uploadRules' => ProfileOptions::UPLOADS,
        ]);
    }

    /** Save one step, either as a lenient draft or as a strictly validated step. */
    public function save(Request $request, string $step): JsonResponse
    {
        $student = $this->student($request);
        $draft = $request->boolean('draft');
        $input = (array) $request->input('data', []);

        $validated = Validator::make(
            $input,
            ProfileRules::rules($step, $student, $input, ! $draft),
        )->validate();

        $values = ProfileRules::normalize($step, $student, $validated);

        $profile = $student->profile ?? new Profile(['student_id' => $student->id, 'student_uuid' => $student->student_uuid, 'registration_no' => $student->registration_no]);
        $completed = collect($profile->completed_steps ?? [])->map(fn ($n) => (int) $n);
        $number = ProfileOptions::STEPS[$step];

        // Qualifications are stored as a plain list; other steps as an object.
        $profile->{ProfileOptions::COLUMNS[$step]} = $step === 'qualifications' ? $values['qualifications'] : $values;
        $profile->completed_steps = ($draft ? $completed->reject(fn ($n) => $n === $number) : $completed->push($number))
            ->unique()->sort()->values()->all();
        $profile->current_step = $draft ? $number : min($number + 1, count(ProfileOptions::STEPS));
        $profile->status = 'draft';
        $profile->submitted_at = null;
        $profile->save();

        return response()->json([
            'success' => true,
            'message' => $draft ? 'Draft saved.' : 'Step saved.',
            'profile' => $this->present($student, $profile),
        ]);
    }

    /** Final submission: every step must be complete and still valid. */
    public function submit(Request $request): JsonResponse
    {
        $student = $this->student($request);
        $profile = $student->profile;

        // Experience is optional; every other step must be complete.
        $incomplete = collect(ProfileOptions::STEPS)
            ->except('experience')
            ->filter(fn ($n) => ! in_array($n, $profile?->completed_steps ?? [], true));

        if (! $profile || $incomplete->isNotEmpty()) {
            throw ValidationException::withMessages([
                'profile' => 'Please complete all required steps before submitting your profile.',
            ]);
        }

        // Re-validate stored data so a stale/edited draft can't slip through.
        foreach (ProfileOptions::COLUMNS as $step => $column) {
            if ($step === 'experience' && $profile->experience === null) {
                continue;
            }

            $data = (array) $profile->{$column};
            $input = $step === 'qualifications' ? ['qualifications' => $data] : $data;

            if (Validator::make($input, ProfileRules::rules($step, $student, $input, true))->fails()) {
                throw ValidationException::withMessages([
                    'profile' => "Step {$this->label($step)} has missing or invalid details. Please review it.",
                ]);
            }
        }

        $profile->update(['status' => 'completed', 'submitted_at' => now()]);

        return response()->json([
            'success' => true,
            'message' => 'Profile submitted successfully.',
            'profile' => $this->present($student, $profile->fresh()),
        ]);
    }

    /** Store a single document/image and return a reference to put in step data. */
    public function upload(Request $request): JsonResponse
    {
        $student = $this->student($request);

        $request->validate(['field' => ['required', 'string', 'in:'.implode(',', array_keys(ProfileOptions::UPLOADS))]]);
        $field = $request->string('field')->toString();
        $spec = ProfileOptions::UPLOADS[$field];

        $request->validate([
            'file' => [
                'required', 'file', "mimes:{$spec['mimes']}", "min:{$spec['min']}", "max:{$spec['max']}",
                function (string $attribute, mixed $file, \Closure $fail) use ($spec) {
                    if (! isset($spec['ratio'])) {
                        return;
                    }
                    $size = @getimagesize($file->getRealPath());
                    if (! $size || $size[1] === 0) {
                        $fail('The file is not a valid image.');

                        return;
                    }
                    $ratio = $size[0] / $size[1];
                    if ($ratio < $spec['ratio'][0] || $ratio > $spec['ratio'][1]) {
                        $fail(sprintf('Image aspect ratio (width ÷ height) must be between %s and %s.', $spec['ratio'][0], $spec['ratio'][1]));
                    }
                },
            ],
        ], [
            'file.min' => "The file must be at least {$spec['min']} KB.",
            'file.max' => "The file must not exceed {$spec['max']} KB.",
            'file.mimes' => 'Allowed formats: '.str_replace(',', ', ', $spec['mimes']).'.',
        ]);

        $file = $request->file('file');
        $path = $file->storeAs(
            "profiles/{$student->id}",
            $field.'-'.bin2hex(random_bytes(8)).'.'.$file->extension(),
            'local',
        );

        return response()->json([
            'path' => $path,
            'name' => $file->getClientOriginalName(),
            'size' => $file->getSize(),
        ], 201);
    }

    /** Stream one of the student's own files (private disk). */
    public function file(Request $request): StreamedResponse
    {
        $student = $this->student($request);
        $path = (string) $request->query('path', '');

        abort_unless(
            str_starts_with($path, "profiles/{$student->id}/") && ! str_contains($path, '..')
                && Storage::disk('local')->exists($path),
            404,
        );

        return Storage::disk('local')->response($path);
    }

    private function student(Request $request): Registration
    {
        return $request->user('student')->loadMissing('profile');
    }

    private function label(string $step): string
    {
        return (string) ProfileOptions::STEPS[$step];
    }

    /** Step data with registration-owned fields pre-filled for a fresh draft. */
    private function present(Registration $student, ?Profile $profile): array
    {
        $personal = $profile?->personal ?? [
            'title' => null,
            'father_name' => $student->father_name,
            'mother_name' => $student->mother_name,
            'gender' => $student->gender,
            'category' => $student->category,
            'is_pwd' => $student->pwbd,
        ];

        return [
            'status' => $profile?->status ?? 'draft',
            'current_step' => $profile?->current_step ?? 1,
            'completed_steps' => $profile?->completed_steps ?? [],
            'personal' => array_merge($personal, [
                'name' => $student->full_name,
                'mobile' => $student->mobile,
                'email' => $student->email,
                'dob' => $student->dob?->toDateString(),
            ]),
            'address' => $profile?->address,
            'experience' => $profile?->experience,
            'other' => $profile?->other_details,
            'qualifications' => $profile?->qualifications ?? [],
            'uploads' => $profile?->uploads,
        ];
    }
}
