<?php

namespace App\Support;

use App\Models\Admin\Recruitment;
use App\Models\Admin\RecruitmentEvent;
use App\Models\Student\Registration;
use App\Support\Admin\RecruitmentOptions;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;

/**
 * Candidate-facing view of what admins have published.
 * Everything on the landing page, student dashboard and notification list comes from here.
 */
class PublicFeed
{
    private const NEW_FOR_DAYS = 7;

    /** @return list<array<string, mixed>> */
    public static function recruitments(): array
    {
        return self::visible()
            ->map(fn (Recruitment $r) => self::card($r))
            ->values()
            ->all();
    }

    /** @return list<array<string, mixed>> */
    public static function notifications(): array
    {
        $items = collect();

        foreach (self::visible() as $r) {
            $items->push([
                'title' => sprintf('Advertisement: %s – %d %s (Advt. No. %s)', $r->title, $r->posts->count(), $r->posts->count() === 1 ? 'post' : 'posts', $r->advt_no),
                'at' => $r->published_at ?? $r->publish_at ?? $r->created_at,
                'type' => 'advertisement',
                'url' => self::pdfUrl($r->advertisement_pdf),
            ]);
        }

        // Corrigenda and cancellation / early-closure notices raised from the admin portal.
        $events = RecruitmentEvent::query()
            ->with('recruitment')
            ->whereIn('type', ['extended', 'closed', 'cancelled'])
            ->latest('id')
            ->get()
            ->filter(fn (RecruitmentEvent $e) => $e->recruitment && $e->recruitment->status !== Recruitment::DRAFT);

        foreach ($events as $e) {
            $r = $e->recruitment;
            $title = match ($e->type) {
                'extended' => sprintf('Corrigendum: Last date extended to %s for %s (Advt. No. %s)', date('d-m-Y', strtotime($e->meta['to'] ?? 'now')), $r->title, $r->advt_no),
                'closed' => sprintf('Notice: Applications closed for %s (Advt. No. %s)', $r->title, $r->advt_no),
                default => sprintf('Notice: %s (Advt. No. %s) has been cancelled', $r->title, $r->advt_no),
            };

            $items->push([
                'title' => $title,
                'at' => $e->created_at,
                'type' => $e->type === 'extended' ? 'corrigendum' : 'notice',
                'url' => '#',
            ]);
        }

        return $items
            ->sortByDesc('at')
            ->values()
            ->map(fn (array $i, int $n) => [
                'id' => $n + 1,
                'title' => $i['title'],
                'date' => $i['at']->format('Y-m-d'),
                'type' => $i['type'],
                'isNew' => $i['at']->gt(now()->subDays(self::NEW_FOR_DAYS)),
                'url' => $i['url'],
            ])
            ->all();
    }

    /** @return list<array{label: string, date: string}> */
    public static function importantDates(?array $featured = null): array
    {
        $featured ??= self::featured();

        return $featured ? self::datesFor(Recruitment::find($featured['id'])) : [];
    }

    /** @return list<array{label: string, date: string}> */
    public static function datesFor(Recruitment $r): array
    {
        return collect([
            // A walk-in notice has no application window; its closing date is just the interview day.
            'Application start' => $r->isWalkIn() ? null : $r->app_start,
            'Application end' => $r->isWalkIn() ? null : $r->app_end,
            'Last date for fee payment' => $r->fee_last_date,
            'Correction window' => $r->correction_end,
            'Admit card release' => $r->admit_card_date,
            'Exam date' => $r->exam_date,
            'Interview date' => isset($r->interview['date']) ? Carbon::parse($r->interview['date']) : null,
            'Interview ends' => isset($r->interview['date_to']) ? Carbon::parse($r->interview['date_to']) : null,
            'Result (tentative)' => $r->result_date,
        ])
            ->filter()
            ->map(fn ($date, $label) => ['label' => $label, 'date' => $date->format('Y-m-d')])
            ->values()
            ->all();
    }

    /** Everything on one advertisement's page: posts, eligibility, fees, documents and dates. */
    public static function detail(Recruitment $r): array
    {
        $r->loadMissing('posts');
        $elig = (array) ($r->eligibility ?? []);
        $docs = (array) ($r->documents ?? []);
        $labels = RecruitmentOptions::DOCUMENTS;

        return self::card($r) + [
            'referenceNo' => $r->reference_no,
            'notificationDate' => $r->notification_date?->format('Y-m-d'),
            'description' => $r->description,
            'syllabusUrl' => $r->syllabus_pdf ? self::pdfUrl($r->syllabus_pdf) : null,
            'dates' => self::datesFor($r),
            'posts' => $r->posts->map(fn ($p) => [
                'id' => $p->id,
                'name' => $p->name,
                'code' => $p->code,
                'monthlySalary' => $p->monthly_salary,
                'isContractual' => (bool) $p->is_contractual,
                'contract' => $p->contract_duration ? "{$p->contract_duration} {$p->contract_unit}(s)" : null,
                'minimumQualification' => $p->minimum_qualification,
                'preferableQualification' => $p->preferable_qualification,
                'ageMax' => $elig['age_max'] ?? null,
                'experienceYears' => $p->experience_years,
                'experienceCriteria' => $p->experience_criteria,
                'reservedFor' => $p->reserved_for,
                'vacancies' => $p->total_vacancies,
                'categoryBreakup' => $p->category_breakup ?? [],
                'womenBreakup' => $p->horizontal['women'] ?? [],
            ])->values()->all(),
            'eligibility' => [
                'ageMin' => $elig['age_min'] ?? null,
                'ageMax' => $elig['age_max'] ?? null,
                'ageCutoff' => $elig['age_cutoff'] ?? null,
                'relaxations' => array_filter((array) ($elig['relaxations'] ?? [])),
                'qualifications' => array_values((array) ($elig['qualifications'] ?? [])),
                'council' => $elig['council'] ?? null,
                'minExperienceYears' => $elig['min_experience_years'] ?? null,
                'prtcRequired' => (bool) ($elig['prtc_required'] ?? false),
                'gender' => $elig['gender'] ?? 'any',
            ],
            'fees' => array_filter((array) (($r->fees ?? [])['amounts'] ?? []), fn ($v) => $v !== null && $v !== ''),
            'documents' => [
                'required' => collect($docs['required'] ?? [])->map(fn ($k) => $labels[$k] ?? $k)->values()->all(),
                'photo' => $docs['photo'] ?? null,
                'signature' => $docs['signature'] ?? null,
            ],
        ];
    }

    /** The advertisement highlighted on the landing page: first open one, else the latest. */
    public static function featured(): ?array
    {
        $all = self::recruitments();

        foreach ($all as $r) {
            if (in_array($r['status'], ['open', 'closing_soon'], true)) {
                return $r;
            }
        }

        return $all[0] ?? null;
    }

    /** @return array<string, int> */
    public static function stats(): array
    {
        $open = collect(self::recruitments())->filter(fn ($r) => in_array($r['status'], ['open', 'closing_soon'], true));

        return [
            'totalVacancies' => (int) $open->sum('vacancies'),
            'activeRecruitments' => $open->count(),
            'registeredApplicants' => Registration::count(),
            'districtsCovered' => 8,
        ];
    }

    /** @return Collection<int, Recruitment> */
    private static function visible(): Collection
    {
        return Recruitment::query()
            ->visibleToPublic()
            ->with('posts')
            ->orderByRaw('coalesce(published_at, publish_at, created_at) desc')
            ->get();
    }

    /** @return array<string, mixed> */
    private static function card(Recruitment $r): array
    {
        $elig = $r->eligibility ?? [];
        $qualifications = collect($elig['qualifications'] ?? [])->pluck('name')->filter()->implode(' / ');

        if (! empty($elig['council'])) {
            $qualifications .= ($qualifications ? ' with ' : '').$elig['council'].' registration';
        }

        $age = isset($elig['age_min'], $elig['age_max']) ? "{$elig['age_min']}–{$elig['age_max']} years" : 'As per advertisement';
        $pay = $r->posts->pluck('monthly_salary')->filter()->unique()->sort()
            ->map(fn ($s) => '₹'.number_format((int) $s).' per month')->implode(', ');
        $published = $r->published_at ?? $r->publish_at ?? $r->created_at;

        return [
            'id' => $r->id,
            'advtNo' => $r->advt_no,
            'postName' => $r->title,
            'department' => $r->directorate ?: 'Health & Family Welfare Department',
            'vacancies' => $r->totalVacancies(),
            'qualification' => $qualifications ?: 'As per advertisement',
            'ageLimit' => $age,
            'payScale' => $pay ?: 'As per advertisement',
            'startDate' => $r->app_start?->format('Y-m-d') ?? $published->format('Y-m-d'),
            'endDate' => $r->app_end?->format('Y-m-d') ?? $published->format('Y-m-d'),
            'status' => $r->displayStatus(),
            'isNew' => $published->gt(now()->subDays(self::NEW_FOR_DAYS)),
            'pdfUrl' => self::pdfUrl($r->advertisement_pdf),
            'summary' => $r->description,
            'selectionMode' => $r->selection_mode,
            'applyMode' => $r->apply_mode,
            'interview' => $r->isInterview() ? [
                'date' => $r->interview['date'] ?? null,
                'dateTo' => $r->interview['date_to'] ?? null,
                'time' => $r->interview['time'] ?? null,
                'venue' => $r->interview['venue'] ?? null,
                'instructions' => $r->interview['instructions'] ?? null,
                'documentsToCarry' => $r->interview['documents_to_carry'] ?? null,
            ] : null,
        ];
    }

    private static function pdfUrl(?string $path): string
    {
        return $path ? Storage::disk('public')->url($path) : '#';
    }
}
