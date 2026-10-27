<?php

namespace App\Support\Student;

use App\Models\Admin\Recruitment;
use App\Models\Admin\RecruitmentPost;
use App\Models\Student\Application;
use App\Models\Student\Registration;
use Illuminate\Support\Carbon;


class ApplicationEligibility
{
    /** @return array{eligible: bool, checks: list<array{key: string, label: string, status: string, message: string}>} */
    public static function evaluate(Registration $student, Recruitment $recruitment, RecruitmentPost $post): array
    {
        $profile = $student->profile;
        $personal = (array) ($profile?->personal ?? []);
        $other = (array) ($profile?->other_details ?? []);
        $elig = (array) ($recruitment->eligibility ?? []);
        $checks = [];

        $add = function (string $key, string $label, string $status, string $message) use (&$checks) {
            $checks[] = compact('key', 'label', 'status', 'message');
        };

        // Window and mode
        $status = $recruitment->displayStatus();
        $open = in_array($status, ['open', 'closing_soon'], true) && ! $recruitment->isWalkIn();
        $add('window', 'Applications open', $open ? 'pass' : 'fail', match (true) {
            $recruitment->isWalkIn() => 'This is a walk-in interview. No online application is needed.',
            $status === 'upcoming' => 'Applications open on '.$recruitment->app_start?->format('d M Y').'.',
            $open => 'Applications close on '.$recruitment->app_end?->format('d M Y').'.',
            default => 'Applications are closed.',
        });

        // Profile
        $complete = $profile?->status === 'completed';
        $add('profile', 'Profile complete', $complete ? 'pass' : 'fail', $complete
            ? 'Your profile is complete.'
            : 'Complete and submit your profile before applying.');

        if (! $complete) {
            return self::result($checks);
        }

        // Age, as on the cut-off date, after the largest relaxation the candidate qualifies for.
        $ageMax = $post->age_max ?? ($elig['age_max'] ?? null);
        $ageMin = $elig['age_min'] ?? null;

        if ($ageMax || $ageMin) {
            $cutoff = Carbon::parse($elig['age_cutoff'] ?? $recruitment->app_end ?? today());
            $age = (int) $student->dob->diffInYears($cutoff);
            [$relax, $relaxLabel] = self::relaxation($student, $other, (array) ($elig['relaxations'] ?? []));
            $limit = $ageMax ? $ageMax + $relax : null;
            $ok = $age >= (int) $ageMin && (! $limit || $age <= $limit);

            $add('age', 'Age limit', $ok ? 'pass' : 'fail', sprintf(
                'Your age on %s is %d. Allowed: %s–%s years%s.',
                $cutoff->format('d M Y'), $age, $ageMin ?: 0, $limit ?? 'no upper limit',
                $relax ? " (includes {$relax} yrs relaxation for {$relaxLabel})" : '',
            ));
        }

        // Gender
        $gender = $elig['gender'] ?? 'any';
        if (in_array($gender, ['male', 'female'], true)) {
            $ok = strtolower((string) $student->gender) === $gender;
            $add('gender', 'Gender', $ok ? 'pass' : 'fail', $ok ? 'Meets the gender requirement.' : "This advertisement is open to {$gender} candidates only.");
        }

        // Permanent Resident Certificate
        if (! empty($elig['prtc_required'])) {
            $ok = ($personal['is_tripura_resident'] ?? null) === 'yes' && ! empty($personal['prtc_number']);
            $add('prtc', 'Tripura PRTC', $ok ? 'pass' : 'fail', $ok ? 'PRTC details found in your profile.' : 'A Permanent Resident Certificate is required. Add it in your profile.');
        }

        // Experience
        $needed = (float) ($post->experience_years ?? $elig['min_experience_years'] ?? 0);
        if ($needed > 0) {
            $has = self::experienceYears((array) ($profile->experience ?? []));
            $add('experience', 'Experience', $has >= $needed ? 'pass' : 'fail', sprintf('%s years required; your profile shows %s.', self::trim($needed), self::trim($has)));
        }

        // Qualification is free text in the advertisement, so the candidate declares it.
        if ($post->minimum_qualification) {
            $add('qualification', 'Qualification', 'info', "Minimum: {$post->minimum_qualification}. You confirm this in the declaration.");
        }

        return self::result($checks);
    }

    /** Application fee for the candidate, in rupees. */
    public static function fee(Registration $student, Recruitment $recruitment): float
    {
        $amounts = (array) (($recruitment->fees ?? [])['amounts'] ?? []);
        $pwbd = ($student->profile?->personal['is_pwd'] ?? $student->pwbd) === 'yes';

        $amount = ($pwbd && isset($amounts['PwBD']) && $amounts['PwBD'] !== '')
            ? $amounts['PwBD']
            : ($amounts[$student->category] ?? 0);

        return (float) $amount;
    }

    /** Eligibility result and key profile fields, frozen with the application. */
    public static function snapshot(Registration $student, array $evaluation): array
    {
        $personal = (array) ($student->profile?->personal ?? []);

        return [
            'name' => $student->full_name,
            'dob' => $student->dob->toDateString(),
            'gender' => $student->gender,
            'category' => $student->category,
            'pwbd' => $personal['is_pwd'] ?? $student->pwbd,
            'mobile' => $student->mobile,
            'email' => $student->email,
            'checks' => $evaluation['checks'],
            // The full profile as submitted, so the downloadable form never changes afterwards.
            'profile' => [
                'personal' => $personal,
                'address' => (array) ($student->profile?->address ?? []),
                'other_details' => (array) ($student->profile?->other_details ?? []),
                'experience' => (array) ($student->profile?->experience ?? []),
                'qualifications' => (array) ($student->profile?->qualifications ?? []),
            ],
        ];
    }

    public static function existing(Registration $student, RecruitmentPost $post): ?Application
    {
        return Application::query()
            ->where('student_id', $student->id)
            ->where('recruitment_post_id', $post->id)
            ->first();
    }

    /** @return array{0: int, 1: string} */
    private static function relaxation(Registration $student, array $other, array $relaxations): array
    {
        $personal = (array) ($student->profile?->personal ?? []);
        $candidates = [
            $student->category => (int) ($relaxations[$student->category] ?? 0),
            'PwBD' => (($personal['is_pwd'] ?? $student->pwbd) === 'yes') ? (int) ($relaxations['PwBD'] ?? 0) : 0,
            'Ex-Serviceman' => (($other['is_ex_serviceman'] ?? null) === 'yes') ? (int) ($relaxations['ExServiceman'] ?? 0) : 0,
        ];
        arsort($candidates);

        return [(int) reset($candidates), (string) key($candidates)];
    }

    private static function experienceYears(array $experience): float
    {
        if (($experience['has_experience'] ?? null) !== 'yes') {
            return 0.0;
        }

        $days = 0;
        foreach ((array) ($experience['entries'] ?? []) as $row) {
            if (empty($row['from_date'])) {
                continue;
            }
            $from = Carbon::parse($row['from_date']);
            $to = empty($row['to_date']) ? today() : Carbon::parse($row['to_date']);
            $days += max(0, $from->diffInDays($to));
        }

        return round($days / 365.25, 1);
    }

    private static function trim(float $n): string
    {
        return rtrim(rtrim(number_format($n, 1), '0'), '.');
    }

    private static function result(array $checks): array
    {
        return [
            'eligible' => collect($checks)->every(fn ($c) => $c['status'] !== 'fail'),
            'checks' => $checks,
        ];
    }
}
