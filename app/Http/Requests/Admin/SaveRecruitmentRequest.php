<?php

namespace App\Http\Requests\Admin;

use App\Models\Admin\Recruitment;
use App\Support\Admin\RecruitmentOptions;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * The wizard posts its structured data as one JSON string (`payload`) plus the
 * PDF uploads, so nested rules can be written against the decoded data.
 */
class SaveRecruitmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $decoded = json_decode((string) $this->input('payload'), true);

        if (is_array($decoded)) {
            $this->merge($decoded);
        }
    }

    public function recruitment(): ?Recruitment
    {
        $bound = $this->route('recruitment');

        return $bound instanceof Recruitment ? $bound : null;
    }

    /** Draft saves are lenient; schedule/publish need the complete advertisement. */
    public function isStrict(): bool
    {
        return in_array($this->input('action'), ['schedule', 'publish'], true);
    }

    public function rules(): array
    {
        $existing = $this->recruitment();
        $strict = $this->isStrict();
        $req = $strict ? 'required' : 'nullable';
        // Walk-in notices have no application window; the interview date closes them.
        $walkIn = $this->input('basic.selection_mode') === 'interview' && $this->input('basic.apply_mode') === 'walk_in';
        $appDate = $walkIn ? 'nullable' : $req;
        $posts = (array) $this->input('posts', []);
        // Contractual engagements have no reservation roster, so the age rules are looser.
        $contractualOnly = $posts !== [] && collect($posts)->every(fn ($p) => ! empty($p['is_contractual']));
        // A published notice keeps its mode, and its interview details must stay filled in.
        $interviewMode = $existing?->isLocked() ? $existing->selection_mode : $this->input('basic.selection_mode');
        $interview = ($strict || $existing?->isLocked()) && $interviewMode === 'interview' ? 'required' : 'nullable';

        $files = [
            'advertisement_pdf' => ['nullable', 'file', 'mimes:pdf', 'max:10240'],
            'syllabus_pdf' => ['nullable', 'file', 'mimes:pdf', 'max:10240'],
        ];

        $dates = [
            'dates' => ['nullable', 'array'],
            'dates.app_start' => [$appDate, 'nullable', 'date'],
            'dates.app_end' => [$appDate, 'nullable', 'date', 'after_or_equal:dates.app_start'],
            'dates.fee_last_date' => ['nullable', 'date'],
            'dates.correction_end' => ['nullable', 'date'],
            'dates.admit_card_date' => ['nullable', 'date'],
            'dates.exam_date' => ['nullable', 'date'],
            'dates.result_date' => ['nullable', 'date'],
        ];

        $interviewRules = [
            'interview' => ['nullable', 'array'],
            'interview.date' => [$interview, 'nullable', 'date'],
            'interview.date_to' => ['nullable', 'date', 'after_or_equal:interview.date'],
            'interview.time' => [$interview, 'nullable', 'date_format:H:i'],
            'interview.venue' => [$interview, 'nullable', 'string', 'max:500'],
            'interview.instructions' => ['nullable', 'string', 'max:3000'],
            'interview.documents_to_carry' => ['nullable', 'string', 'max:3000'],
        ];

        // Once visible to candidates only the description, dates, interview details and attachments may change.
        if ($existing?->isLocked()) {
            return [
                'basic.description' => ['nullable', 'string', 'max:5000'],
                ...$dates,
                ...$interviewRules,
                ...$files,
            ];
        }

        return [
            'action' => ['required', Rule::in(['draft', 'schedule', 'publish'])],
            'publish_at' => ['nullable', 'required_if:action,schedule', 'date', 'after:now'],

            'basic.advt_no' => ['required', 'string', 'max:100', Rule::unique(Recruitment::class, 'advt_no')->ignore($existing?->id)],
            'basic.title' => ['required', 'string', 'max:255'],
            'basic.directorate' => [$req, 'nullable', 'string', 'max:255'],
            'basic.reference_no' => ['nullable', 'string', 'max:100'],
            'basic.notification_date' => [$req, 'nullable', 'date'],
            'basic.description' => ['nullable', 'string', 'max:5000'],
            'basic.selection_mode' => ['required', Rule::in(['exam', 'interview'])],
            'basic.apply_mode' => ['required', Rule::in(['online', 'walk_in'])],

            'posts' => [$strict ? 'required' : 'nullable', 'array', $strict ? 'min:1' : 'min:0'],
            'posts.*.name' => ['required', 'string', 'max:255'],
            'posts.*.code' => ['nullable', 'string', 'max:50'],
            'posts.*.monthly_salary' => [$req, 'nullable', 'integer', 'min:0', 'max:10000000'],
            'posts.*.is_contractual' => ['nullable', 'boolean'],
            'posts.*.minimum_qualification' => [$req, 'nullable', 'string', 'max:255'],
            'posts.*.preferable_qualification' => ['nullable', 'string', 'max:500'],
            'posts.*.experience_years' => ['nullable', 'numeric', 'min:0', 'max:50'],
            'posts.*.experience_criteria' => ['nullable', 'string', 'max:500'],
            'posts.*.reserved_for' => ['nullable', Rule::in(RecruitmentOptions::CATEGORIES)],
            'posts.*.contract_duration' => ['nullable', 'integer', 'min:1'],
            'posts.*.contract_unit' => ['nullable', Rule::in(['day', 'month', 'year'])],
            'posts.*.total_vacancies' => [$strict ? 'required' : 'nullable', 'integer', $strict ? 'min:1' : 'min:0', 'max:100000'],
            'posts.*.category_breakup' => ['nullable', 'array'],
            'posts.*.category_breakup.*' => ['nullable', 'integer', 'min:0'],
            'posts.*.horizontal' => ['nullable', 'array'],
            'posts.*.horizontal.pwbd' => ['nullable', 'integer', 'min:0'],
            'posts.*.horizontal.women' => ['nullable', 'array'],
            'posts.*.horizontal.women.*' => ['nullable', 'integer', 'min:0'],
            'posts.*.horizontal.ex_serviceman' => ['nullable', 'array'],
            'posts.*.horizontal.ex_serviceman.*' => ['nullable', 'integer', 'min:0'],
            'posts.*.district_breakup' => ['nullable', 'array'],
            'posts.*.district_breakup.*.district' => ['required', 'string'],
            'posts.*.district_breakup.*.vacancies' => ['nullable', 'integer', 'min:0'],

            'eligibility' => ['nullable', 'array'],
            'eligibility.age_min' => [$req, 'nullable', 'integer', 'min:14', 'max:80'],
            'eligibility.age_max' => [$contractualOnly ? 'nullable' : $req, 'nullable', 'integer', 'min:14', 'max:80', 'gte:eligibility.age_min'],
            'eligibility.age_cutoff' => [$contractualOnly ? ($strict ? 'required_with:eligibility.age_max' : 'nullable') : $req, 'nullable', 'date'],
            'eligibility.relaxations' => ['nullable', 'array'],
            'eligibility.relaxations.*' => ['nullable', 'integer', 'min:0', 'max:30'],
            'eligibility.qualifications' => [$strict ? 'required' : 'nullable', 'array', $strict ? 'min:1' : 'min:0'],
            'eligibility.qualifications.*.name' => ['required', 'string'],
            'eligibility.qualifications.*.min_percent' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'eligibility.council' => ['nullable', 'string', 'max:255'],
            'eligibility.min_experience_years' => ['nullable', 'numeric', 'min:0', 'max:50'],
            'eligibility.prtc_required' => ['nullable', 'boolean'],
            'eligibility.gender' => ['nullable', Rule::in(['any', 'male', 'female'])],

            'fees' => ['nullable', 'array'],
            'fees.amounts' => ['nullable', 'array'],
            'fees.amounts.*' => ['nullable', 'numeric', 'min:0', 'max:100000'],

            'documents' => ['nullable', 'array'],
            'documents.required' => ['nullable', 'array'],
            'documents.required.*' => ['string', Rule::in(array_keys(RecruitmentOptions::DOCUMENTS))],
            'documents.photo.min_kb' => ['nullable', 'integer', 'min:1'],
            'documents.photo.max_kb' => ['nullable', 'integer', 'min:1', 'gte:documents.photo.min_kb'],
            'documents.signature.min_kb' => ['nullable', 'integer', 'min:1'],
            'documents.signature.max_kb' => ['nullable', 'integer', 'min:1', 'gte:documents.signature.min_kb'],

            ...$dates,
            ...$interviewRules,
            ...$files,
        ];
    }

    public function after(): array
    {
        return [function (Validator $validator) {
            if ($this->recruitment()?->isLocked()) {
                return;
            }

            foreach ((array) $this->input('posts', []) as $i => $post) {
                // Women / Ex-Servicemen seats sit inside their category, so they cannot exceed it.
                foreach (['women' => 'Women', 'ex_serviceman' => 'Ex-Serviceman'] as $key => $label) {
                    foreach ((array) ($post['horizontal'][$key] ?? []) as $category => $seats) {
                        if ((int) $seats > (int) ($post['category_breakup'][$category] ?? 0)) {
                            $validator->errors()->add("posts.$i.horizontal", "$label seats in $category ($seats) cannot exceed the $category vacancies.");
                        }
                    }
                }

                if ((int) ($post['horizontal']['pwbd'] ?? 0) > (int) ($post['total_vacancies'] ?? 0)) {
                    $validator->errors()->add("posts.$i.horizontal", 'PwBD seats cannot exceed the total vacancies.');
                }
            }

            if ($this->isStrict()) {
                foreach ((array) $this->input('posts', []) as $i => $post) {
                    $total = (int) ($post['total_vacancies'] ?? 0);
                    $sum = array_sum(array_map('intval', (array) ($post['category_breakup'] ?? [])));

                    // Contractual engagements have no roster unless the advertisement lists one.
                    if (! empty($post['is_contractual']) && $sum === 0) {
                        continue;
                    }

                    if ($sum !== $total) {
                        $validator->errors()->add("posts.$i.category_breakup", "Category-wise vacancies ($sum) must add up to the total ($total).");
                    }

                    $districts = array_sum(array_map(fn ($d) => (int) ($d['vacancies'] ?? 0), (array) ($post['district_breakup'] ?? [])));

                    if ($districts > 0 && $districts !== $total) {
                        $validator->errors()->add("posts.$i.district_breakup", "District-wise vacancies ($districts) must add up to the total ($total).");
                    }
                }
            }
        }, function (Validator $validator) {
            if ($this->isStrict() && ! $this->hasFile('advertisement_pdf') && ! $this->recruitment()?->advertisement_pdf) {
                $validator->errors()->add('advertisement_pdf', 'Upload the official advertisement PDF before publishing.');
            }
        }];
    }
}
