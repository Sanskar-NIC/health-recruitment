<?php

namespace App\Support;

use App\Models\Admin\RecruitmentExam;
use App\Models\Student\Application;

/** What a candidate may see about the written exam, given what the department has released so far. */
class ExamProgress
{
    /** applied | shortlisted | admit_card | result */
    public static function stage(Application $a): string
    {
        $exam = $a->exam;

        if ($a->shortlisted_at && $exam?->results_published_at) {
            return 'result';
        }

        if (self::admitCardReady($a)) {
            return 'admit_card';
        }

        return $a->shortlisted_at ? 'shortlisted' : 'applied';
    }

    public static function admitCardReady(Application $a): bool
    {
        return $a->isActive() && $a->shortlisted_at && $a->exam_centre_id && $a->roll_no && $a->exam?->admit_cards_released_at;
    }

    /** @return array<string, mixed>|null */
    public static function admitCard(Application $a): ?array
    {
        if (! self::admitCardReady($a)) {
            return null;
        }

        return ['url' => "/student/applications/{$a->id}/admit-card"] + self::details($a);
    }

    /** @return array<string, mixed> */
    public static function details(Application $a): array
    {
        $exam = $a->exam;
        $centre = $a->examCentre;

        return [
            'rollNo' => $a->roll_no,
            'examDate' => $exam?->exam_date?->toDateString(),
            'reportingTime' => RecruitmentExam::clock($exam?->reporting_time),
            'startTime' => RecruitmentExam::clock($exam?->start_time),
            'endTime' => RecruitmentExam::clock($exam?->end_time),
            'instructions' => $exam?->instructions,
            'centre' => $centre ? ['name' => $centre->name, 'address' => $centre->address, 'city' => $centre->city] : null,
        ];
    }

    /** @return array<string, mixed>|null */
    public static function result(Application $a): ?array
    {
        if (! $a->shortlisted_at || ! $a->exam?->results_published_at) {
            return null;
        }

        return [
            'selected' => $a->is_selected,
            'marksObtained' => $a->is_selected && $a->marks_obtained !== null ? (float) $a->marks_obtained : null,
            'marksTotal' => $a->is_selected && $a->marks_total !== null ? (float) $a->marks_total : null,
            'publishedAt' => $a->exam->results_published_at->toIso8601String(),
        ];
    }

    /** @return array<string, mixed> */
    public static function forStudent(Application $a): array
    {
        return [
            'stage' => self::stage($a),
            'shortlisted' => (bool) $a->shortlisted_at,
            'admitCard' => self::admitCard($a),
            'result' => self::result($a),
        ];
    }
}
