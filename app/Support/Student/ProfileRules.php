<?php

namespace App\Support\Student;

use App\Models\Student\Registration;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\RequiredIf;

/**
 * Validation rules and normalisation for each profile wizard step.
 *
 * "Strict" rules are used for Save & Next / final submit. Draft saves use the
 * same rules with every `required*` constraint removed, so partially filled
 * data is stored but anything that *is* filled must still be well-formed.
 */
class ProfileRules
{
    public static function rules(string $step, Registration $student, array $d, bool $strict): array
    {
        $rules = match ($step) {
            'personal' => self::personal($student, $d),
            'address' => self::address($d),
            'other' => self::other($d),
            'experience' => self::experience($student, $d),
            'qualifications' => self::qualifications($student, $d),
            'uploads' => self::uploads($student),
        };

        return $strict ? self::allowNull($rules) : self::relax($rules);
    }

    /** Fill server-owned values and drop fields hidden by conditional answers. */
    public static function normalize(string $step, Registration $student, array $v): array
    {
        return match ($step) {
            'personal' => self::normalizePersonal($student, $v),
            'address' => self::normalizeAddress($v),
            'other' => self::normalizeOther($v),
            'experience' => self::normalizeExperience($v),
            'qualifications' => self::normalizeQualifications($v),
            default => $v,
        };
    }

    /**
     * Hidden/optional fields arrive as null. Anything not unconditionally
     * `required` must accept null, otherwise `string`/`date`/... reject it.
     * Conditional requireds (RequiredIf) still fail on null when they apply.
     */
    private static function allowNull(array $rules): array
    {
        return collect($rules)->map(fn (array $rule) => in_array('required', $rule, true)
            ? $rule
            : array_values(array_unique(array_merge(['nullable'], $rule), SORT_REGULAR)))->all();
    }

    private static function relax(array $rules): array
    {
        return collect($rules)->map(function (array $rule) {
            $kept = array_filter($rule, fn ($r) => ! ($r instanceof RequiredIf)
                && ! (is_string($r) && str_starts_with($r, 'required')));

            return array_values(array_merge(['nullable'], array_filter($kept, fn ($r) => $r !== 'nullable')));
        })->all();
    }

    private static function personal(Registration $student, array $d): array
    {
        $resident = ($d['is_tripura_resident'] ?? null) === 'yes';
        $reserved = ! in_array($d['category'] ?? 'UR', ['UR', null, ''], true);
        $pwd = ($d['is_pwd'] ?? null) === 'yes';
        $yesNo = Rule::in(['yes', 'no']);

        return array_merge([
            'is_tripura_resident' => ['required', $yesNo],
            'prtc_number' => [Rule::requiredIf($resident), 'string', 'max:50'],
            'prtc_district' => [Rule::requiredIf($resident), Rule::in(ProfileOptions::DISTRICTS)],
            'prtc_issue_date' => [Rule::requiredIf($resident), 'date', 'before_or_equal:today'],
        ], self::fileRef('prtc_certificate', $student, $resident), [
            'title' => ['required', Rule::in(ProfileOptions::TITLES)],
            'father_name' => ['required', 'string', 'max:255'],
            'mother_name' => ['required', 'string', 'max:255'],
            'nationality' => ['required', 'string', 'max:50'],
            'gender' => ['required', Rule::in(ProfileOptions::GENDERS)],
            'mother_tongue' => ['required', 'string', 'max:50'],
            'marital_status' => ['required', Rule::in(ProfileOptions::MARITAL_STATUSES)],

            'aadhaar_no' => ['required', 'regex:/^[2-9][0-9]{11}$/'],
            'aadhaar_name' => ['required', 'string', 'max:255'],
        ], self::fileRef('aadhaar_front', $student, true), self::fileRef('aadhaar_back', $student, true), [
            'category' => ['required', Rule::in(ProfileOptions::CATEGORIES)],
            'cert_number' => [Rule::requiredIf($reserved), 'string', 'max:100'],
            'cert_district' => [Rule::requiredIf($reserved), Rule::in(ProfileOptions::DISTRICTS)],
            'cert_date' => [Rule::requiredIf($reserved), 'date', 'before_or_equal:today'],

            'is_pwd' => ['required', $yesNo],
            'ph_percentage' => [Rule::requiredIf($pwd), 'numeric', 'gt:0', 'max:100'],
        ]);
    }

    private static function normalizePersonal(Registration $student, array $v): array
    {
        // Identity fixed at registration cannot be altered from the profile.
        $v['name'] = $student->full_name;
        $v['mobile'] = $student->mobile;
        $v['email'] = $student->email;
        $v['dob'] = $student->dob?->toDateString();

        if (($v['is_tripura_resident'] ?? null) !== 'yes') {
            foreach (['prtc_number', 'prtc_district', 'prtc_issue_date', 'prtc_certificate'] as $k) {
                $v[$k] = null;
            }
        }
        if (in_array($v['category'] ?? 'UR', ['UR', null, ''], true)) {
            foreach (['cert_number', 'cert_district', 'cert_date'] as $k) {
                $v[$k] = null;
            }
        }
        if (($v['is_pwd'] ?? null) !== 'yes') {
            $v['ph_percentage'] = null;
        }

        return $v;
    }

    private static function address(array $d): array
    {
        $same = filter_var($d['same_as_permanent'] ?? false, FILTER_VALIDATE_BOOLEAN);

        return array_merge(
            ['same_as_permanent' => ['required', 'boolean']],
            self::addressBlock('permanent', true),
            self::addressBlock('correspondence', ! $same),
        );
    }

    private static function addressBlock(string $key, bool $required): array
    {
        $req = fn () => Rule::requiredIf($required);

        return [
            $key => ['array'],
            "$key.house" => ['nullable', 'string', 'max:255'],
            "$key.street" => ['nullable', 'string', 'max:255'],
            "$key.locality" => ['nullable', 'string', 'max:255'],
            "$key.po" => [$req(), 'string', 'max:100'],
            "$key.ps" => [$req(), 'string', 'max:100'],
            "$key.pincode" => [$req(), 'regex:/^[1-9][0-9]{5}$/'],
            "$key.state" => [$req(), 'string', 'max:100'],
            "$key.city" => [$req(), 'string', 'max:100'],
            "$key.district" => [$req(), 'string', 'max:100'],
        ];
    }

    private static function normalizeAddress(array $v): array
    {
        $v['same_as_permanent'] = (bool) ($v['same_as_permanent'] ?? false);

        if ($v['same_as_permanent']) {
            $v['correspondence'] = $v['permanent'] ?? null;
        }

        return $v;
    }

    private static function other(array $d): array
    {
        $bpl = ($d['is_bpl'] ?? null) === 'yes';
        $yesNo = Rule::in(['yes', 'no']);

        return [
            'is_bpl' => ['required', $yesNo],
            'bpl_number' => [Rule::requiredIf($bpl), 'string', 'max:100'],
            'bpl_district' => [Rule::requiredIf($bpl), Rule::in(ProfileOptions::DISTRICTS)],
            'bpl_date' => ['nullable', 'date', 'before_or_equal:today'],
            'is_govt_employee' => ['required', $yesNo],
            'is_ex_serviceman' => ['required', $yesNo],
            'height_cm' => ['nullable', 'numeric', 'between:50,250'],
            'chest_cm' => ['nullable', 'numeric', 'between:30,200'],
            'weight_kg' => ['nullable', 'numeric', 'between:10,300'],
        ];
    }

    private static function normalizeOther(array $v): array
    {
        if (($v['is_bpl'] ?? null) !== 'yes') {
            foreach (['bpl_number', 'bpl_district', 'bpl_date'] as $k) {
                $v[$k] = null;
            }
        }

        return $v;
    }

    private static function experience(Registration $student, array $d): array
    {
        $has = ($d['has_experience'] ?? null) === 'yes';
        $rules = [
            'has_experience' => ['required', Rule::in(['yes', 'no'])],
            'entries' => [Rule::requiredIf($has), 'array', 'max:10'],
            'entries.*' => ['array'],
            'entries.*.employer' => [Rule::requiredIf($has), 'string', 'max:255'],
            'entries.*.designation' => [Rule::requiredIf($has), 'string', 'max:255'],
            'entries.*.sector' => [Rule::requiredIf($has), Rule::in(ProfileOptions::SECTORS)],
            'entries.*.from_date' => [Rule::requiredIf($has), 'date', 'before_or_equal:today'],
            'entries.*.currently_working' => ['nullable', 'boolean'],
        ];

        $entries = is_array($d['entries'] ?? null) ? $d['entries'] : [];

        foreach (array_keys($entries) as $i) {
            $working = filter_var($entries[$i]['currently_working'] ?? false, FILTER_VALIDATE_BOOLEAN);

            $rules["entries.$i.to_date"] = [Rule::requiredIf($has && ! $working), 'date', 'before_or_equal:today', "after_or_equal:entries.$i.from_date"];
            $rules += self::fileRef("entries.$i.document", $student, $has);
        }

        return $rules;
    }

    private static function normalizeExperience(array $v): array
    {
        $has = ($v['has_experience'] ?? null) === 'yes';

        $entries = $has ? array_map(function ($row) {
            if (! empty($row['currently_working'])) {
                $row['to_date'] = null;
            }
            $row['currently_working'] = (bool) ($row['currently_working'] ?? false);

            return $row;
        }, $v['entries'] ?? []) : [];

        return ['has_experience' => $has ? 'yes' : 'no', 'entries' => array_values($entries)];
    }

    private static function qualifications(Registration $student, array $d): array
    {
        $rules = [
            'qualifications' => ['required', 'array', 'min:1', 'max:10'],
            'qualifications.*' => ['array'],
            'qualifications.*.type' => ['required', Rule::in(ProfileOptions::QUALIFICATION_TYPES)],
            'qualifications.*.stream' => ['required', Rule::in(ProfileOptions::STREAMS)],
            'qualifications.*.result_status' => ['required', Rule::in(ProfileOptions::RESULT_STATUSES)],
            'qualifications.*.year' => ['required', 'integer', 'between:1950,'.((int) date('Y') + 1)],
            'qualifications.*.marks_type' => ['required', Rule::in(ProfileOptions::MARKS_TYPES)],
            'qualifications.*.state' => ['required', 'string', 'max:100'],
            'qualifications.*.board' => ['required', 'string', 'max:255'],
        ];

        foreach (array_keys(is_array($d['qualifications'] ?? null) ? $d['qualifications'] : []) as $i) {
            $type = $d['qualifications'][$i]['marks_type'] ?? null;
            $byMarks = $type === 'MARKS';
            $byPct = $type === 'PERCENTAGE';

            $rules["qualifications.$i.out_of"] = [Rule::requiredIf(! $byPct), 'numeric', 'gt:0', 'max:100000'];
            $rules["qualifications.$i.obtained"] = [Rule::requiredIf(! $byPct), 'numeric', 'gte:0', "lte:qualifications.$i.out_of"];
            $rules["qualifications.$i.percentage"] = [Rule::requiredIf(! $byMarks), 'numeric', 'between:0,100'];
            $rules += self::fileRef("qualifications.$i.document", $student, true);
        }

        return $rules;
    }

    private static function normalizeQualifications(array $v): array
    {
        $rows = array_map(function ($row) {
            if (($row['marks_type'] ?? null) === 'MARKS' && ! empty($row['out_of']) && isset($row['obtained'])) {
                $row['percentage'] = round($row['obtained'] / $row['out_of'] * 100, 2);
            }
            if (($row['marks_type'] ?? null) === 'PERCENTAGE') {
                $row['out_of'] = $row['obtained'] = null;
            }

            return $row;
        }, $v['qualifications'] ?? []);

        return ['qualifications' => array_values($rows)];
    }

    private static function uploads(Registration $student): array
    {
        return array_merge(
            self::fileRef('photo', $student, true),
            self::fileRef('signature', $student, true),
        );
    }

    /** A stored-file reference {path, name, size} that must belong to this student. */
    private static function fileRef(string $key, Registration $student, bool $required): array
    {
        $dir = "profiles/{$student->id}/";

        return [
            $key => [Rule::requiredIf($required), 'array'],
            "$key.path" => [
                Rule::requiredIf($required),
                'string',
                function (string $attribute, mixed $value, \Closure $fail) use ($dir) {
                    if (! str_starts_with($value, $dir) || str_contains($value, '..')
                        || ! Storage::disk('local')->exists($value)) {
                        $fail('The uploaded file is invalid. Please upload it again.');
                    }
                },
            ],
            "$key.name" => ['nullable', 'string', 'max:255'],
            "$key.size" => ['nullable', 'integer'],
        ];
    }
}
