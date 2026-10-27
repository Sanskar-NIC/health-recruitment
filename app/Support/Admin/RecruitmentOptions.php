<?php

namespace App\Support\Admin;

use App\Models\Admin\Post;
use App\Support\Student\ProfileOptions;

/**
 * Reference data for the recruitment wizard.
 * Static for now; the Masters module will replace these with database lookups.
 */
class RecruitmentOptions
{
    public const CATEGORIES = ['UR', 'SC', 'ST', 'OBC', 'EWS'];

    public const HORIZONTAL = ['pwbd' => 'PwBD', 'ex_serviceman' => 'Ex-Serviceman', 'women' => 'Women'];

    public const RELAXATIONS = ['SC', 'ST', 'OBC', 'EWS', 'PwBD', 'ExServiceman'];

    public const FEE_CATEGORIES = ['UR', 'SC', 'ST', 'OBC', 'EWS', 'PwBD'];

    public const QUALIFICATIONS = [
        'Class 10', 'Class 12', 'GNM', 'ANM', 'B.Sc Nursing', 'M.Sc Nursing', 'MBBS', 'MD/MS', 'BDS',
        'D.Pharm', 'B.Pharm', 'DMLT', 'B.Sc MLT', 'BPT', 'Diploma in Radiography', 'Diploma in Ophthalmic Technique',
    ];

    public const COUNCILS = [
        'Tripura Nursing Council', 'Tripura Medical Council', 'Tripura Pharmacy Council',
        'Tripura Dental Council', 'Rehabilitation Council of India',
    ];

    public const DOCUMENTS = [
        'class10_certificate' => '10th Certificate',
        'class12_certificate' => '12th Certificate',
        'degree_certificate' => 'Degree / Diploma Certificate',
        'council_registration' => 'Council Registration Certificate',
        'caste_certificate' => 'Caste Certificate',
        'prtc' => 'PRTC (Permanent Resident Certificate)',
        'pwbd_certificate' => 'Disability Certificate',
        'experience_certificate' => 'Experience Certificate',
        'id_proof' => 'ID Proof',
    ];

    /** @return array<string, mixed> */
    public static function forClient(): array
    {
        return [
            'categories' => self::CATEGORIES,
            'horizontal' => self::HORIZONTAL,
            'relaxations' => self::RELAXATIONS,
            'feeCategories' => self::FEE_CATEGORIES,
            'qualifications' => self::QUALIFICATIONS,
            'councils' => self::COUNCILS,
            'documents' => self::DOCUMENTS,
            'districts' => ProfileOptions::DISTRICTS,
            'posts' => Post::query()->where('is_active', true)->orderBy('name')
                ->get(['name', 'code', 'is_contractual', 'minimum_qualification', 'preferable_qualification', 'experience_required', 'experience_years', 'experience_criteria'])->values(),
        ];
    }
}
