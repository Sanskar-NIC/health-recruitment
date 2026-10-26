<?php

namespace App\Support\Admin;

use App\Models\Admin\Recruitment;
use Illuminate\Support\Facades\Storage;

class RecruitmentPresenter
{
    /** Row for the "All Recruitments" table. */
    public static function row(Recruitment $r): array
    {
        return [
            'id' => $r->id,
            'advt_no' => $r->advt_no,
            'title' => $r->title,
            'posts_count' => $r->posts->count(),
            'vacancies' => $r->totalVacancies(),
            'app_start' => $r->app_start?->format('Y-m-d'),
            'app_end' => $r->app_end?->format('Y-m-d'),
            'publish_at' => $r->publish_at?->toIso8601String(),
            'status' => $r->displayStatus(),
            'applications' => 0, // wired up when the applications module exists
            'locked' => $r->isLocked(),
            'is_draft' => $r->status === Recruitment::DRAFT,
            'is_cancelled' => $r->status === Recruitment::CANCELLED,
            'year' => ($r->notification_date ?? $r->created_at)->format('Y'),
        ];
    }

    /** Full data for the wizard / read-only preview. */
    public static function form(Recruitment $r): array
    {
        $r->loadMissing('posts');

        return [
            'id' => $r->id,
            'status' => $r->displayStatus(),
            'locked' => $r->isLocked(),
            'publish_at' => $r->publish_at?->format('Y-m-d\TH:i'),
            'status_reason' => $r->status_reason,
            'basic' => [
                'advt_no' => $r->advt_no,
                'title' => $r->title,
                'directorate' => $r->directorate,
                'reference_no' => $r->reference_no,
                'notification_date' => $r->notification_date?->format('Y-m-d'),
                'description' => $r->description,
                'selection_mode' => $r->selection_mode,
                'apply_mode' => $r->apply_mode,
            ],
            'interview' => $r->interview,
            'posts' => $r->posts->map(fn ($p) => [
                'name' => $p->name,
                'code' => $p->code,
                'monthly_salary' => $p->monthly_salary,
                'is_contractual' => (bool) $p->is_contractual,
                'contract_duration' => $p->contract_duration,
                'contract_unit' => $p->contract_unit,
                'minimum_qualification' => $p->minimum_qualification,
                'preferable_qualification' => $p->preferable_qualification,
                'age_max' => $p->age_max,
                'experience_years' => $p->experience_years,
                'reserved_for' => $p->reserved_for,
                'total_vacancies' => $p->total_vacancies,
                'category_breakup' => $p->category_breakup ?? [],
                'horizontal' => $p->horizontal ?? [],
                'district_breakup' => $p->district_breakup ?? [],
            ])->values(),
            'eligibility' => $r->eligibility,
            'fees' => $r->fees,
            'documents' => $r->documents,
            'dates' => [
                'app_start' => $r->app_start?->format('Y-m-d'),
                'app_end' => $r->app_end?->format('Y-m-d'),
                'fee_last_date' => $r->fee_last_date?->format('Y-m-d'),
                'correction_end' => $r->correction_end?->format('Y-m-d'),
                'admit_card_date' => $r->admit_card_date?->format('Y-m-d'),
                'exam_date' => $r->exam_date?->format('Y-m-d'),
                'result_date' => $r->result_date?->format('Y-m-d'),
            ],
            'advertisement_url' => $r->advertisement_pdf ? Storage::disk('public')->url($r->advertisement_pdf) : null,
            'syllabus_url' => $r->syllabus_pdf ? Storage::disk('public')->url($r->syllabus_pdf) : null,
        ];
    }

    public static function event($e): array
    {
        return [
            'id' => $e->id,
            'type' => $e->type,
            'reason' => $e->reason,
            'meta' => $e->meta,
            'by' => $e->admin?->name,
            'at' => $e->created_at->toIso8601String(),
        ];
    }
}
