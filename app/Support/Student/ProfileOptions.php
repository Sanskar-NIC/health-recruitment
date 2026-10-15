<?php

namespace App\Support\Student;

use App\Models\Student\Profile;

/**
 * Single source of truth for the dropdown values used by the profile wizard
 * (validated server-side, rendered client-side).
 */
class ProfileOptions
{
    public const STEPS = [
        'personal' => 1,
        'address' => 2,
        'other' => 3,
        'qualifications' => 4,
        'experience' => 5,
        'uploads' => 6,
    ];

    /** Step slug => profile column. */
    public const COLUMNS = [
        'personal' => 'personal',
        'address' => 'address',
        'other' => 'other_details',
        'qualifications' => 'qualifications',
        'experience' => 'experience',
        'uploads' => 'uploads',
    ];

    public const LABELS = [
        'personal' => 'Personal Information',
        'address' => 'Address Details',
        'other' => 'Other Details',
        'qualifications' => 'Qualification Details',
        'experience' => 'Experience Details',
        'uploads' => 'Photo & Signature',
    ];

    public const TITLES = ['Mr', 'Mrs', 'Miss', 'Ms', 'Dr'];

    public const GENDERS = ['Male', 'Female', 'Transgender'];

    public const MARITAL_STATUSES = ['Single', 'Married', 'Divorced', 'Widowed'];

    public const CATEGORIES = ['UR', 'SC', 'ST', 'OBC', 'EWS'];

    public const DISTRICTS = [
        'Dhalai', 'Gomati', 'Khowai', 'North Tripura',
        'Sepahijala', 'South Tripura', 'Unakoti', 'West Tripura',
    ];

    public const QUALIFICATION_TYPES = [
        'SSC/Madhyamik', 'HSC/Higher Secondary', 'Diploma', 'Graduation', 'Post Graduation', 'PhD', 'Other',
    ];

    public const STREAMS = ['Science', 'Arts', 'Commerce', 'Other'];

    /** The only stream offered for SSC/Madhyamik, which has no branch split. */
    public const GENERAL_STREAM = 'General / All Subjects';

    public const SSC_TYPE = 'SSC/Madhyamik';

    public const HSC_TYPE = 'HSC/Higher Secondary';

    public const RESULT_STATUSES = ['PASSED', 'APPEARED / RESULT AWAITED'];

    public const SECTORS = ['Government', 'Private', 'Self-employed', 'Other'];

    public const MARKS_TYPES = ['MARKS', 'PERCENTAGE', 'CGPA'];

    /** Upload field => [mimes, min KB, max KB, aspect ratio range|null]. */
    public const UPLOADS = [
        'prtc_certificate' => ['mimes' => 'jpg,jpeg,png,pdf', 'min' => 1, 'max' => 2048],
        'aadhaar_front' => ['mimes' => 'jpg,jpeg,png,pdf', 'min' => 1, 'max' => 2048],
        'aadhaar_back' => ['mimes' => 'jpg,jpeg,png,pdf', 'min' => 1, 'max' => 2048],
        'experience_document' => ['mimes' => 'pdf', 'min' => 1, 'max' => 2048],
        'qualification_document' => ['mimes' => 'pdf', 'min' => 1, 'max' => 2048],
        'photo' => ['mimes' => 'jpg,jpeg,png', 'min' => 30, 'max' => 200, 'ratio' => [0.75, 1.5]],
        'signature' => ['mimes' => 'jpg,jpeg,png', 'min' => 30, 'max' => 100, 'ratio' => [2, 5]],
    ];

    /** Progress summary shown in the applicant banner. Experience is optional. */
    public static function summary(?Profile $profile): array
    {
        $done = $profile?->completed_steps ?? [];
        $required = collect(self::STEPS)->except('experience');
        $pending = $required->reject(fn ($n) => in_array($n, $done, true));

        return [
            'status' => $profile?->status ?? 'draft',
            'completed' => $required->count() - $pending->count(),
            'total' => $required->count(),
            'pending' => $pending->keys()->map(fn ($step) => self::LABELS[$step])->values()->all(),
        ];
    }

    public static function forClient(): array
    {
        return [
            'titles' => self::TITLES,
            'genders' => self::GENDERS,
            'maritalStatuses' => self::MARITAL_STATUSES,
            'categories' => self::CATEGORIES,
            'districts' => self::DISTRICTS,
            'qualificationTypes' => self::QUALIFICATION_TYPES,
            'streams' => self::STREAMS,
            'resultStatuses' => self::RESULT_STATUSES,
            'marksTypes' => self::MARKS_TYPES,
            'sectors' => self::SECTORS,
        ];
    }
}
