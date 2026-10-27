<?php

namespace App\Actions\Admin;

use App\Models\Admin\Recruitment;
use App\Models\Admin\RecruitmentEvent;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class SaveRecruitment
{
    private const DATE_FIELDS = ['app_start', 'app_end', 'fee_last_date', 'correction_end', 'admit_card_date', 'exam_date', 'result_date'];

    /**
     * @param  array<string, mixed>  $data  validated payload
     */
    public function handle(?Recruitment $recruitment, array $data, int $adminId, ?UploadedFile $advertisement, ?UploadedFile $syllabus): Recruitment
    {
        return DB::transaction(function () use ($recruitment, $data, $adminId, $advertisement, $syllabus) {
            $isNew = $recruitment === null;
            $recruitment ??= new Recruitment(['created_by' => $adminId]);
            $locked = ! $isNew && $recruitment->isLocked();
            $before = $this->snapshot($recruitment);

            $recruitment->updated_by = $adminId;
            $recruitment->description = Arr::get($data, 'basic.description');

            foreach (self::DATE_FIELDS as $field) {
                $recruitment->{$field} = Arr::get($data, "dates.$field") ?: null;
            }

            // Interview details stay editable after publishing (venues and dates get rescheduled).
            // A locked notice's mode cannot change, and its validated data no longer carries it.
            $mode = $locked ? $recruitment->selection_mode : Arr::get($data, 'basic.selection_mode');
            $recruitment->interview = $this->interviewDetails($data, $mode);

            if ($advertisement) {
                $this->deleteFile($recruitment->advertisement_pdf);
                $recruitment->advertisement_pdf = $advertisement->store('recruitments', 'public');
            }

            if ($syllabus) {
                $this->deleteFile($recruitment->syllabus_pdf);
                $recruitment->syllabus_pdf = $syllabus->store('recruitments', 'public');
            }

            if (! $locked) {
                $recruitment->fill([
                    'advt_no' => $data['basic']['advt_no'],
                    'title' => $data['basic']['title'],
                    'directorate' => Arr::get($data, 'basic.directorate'),
                    'reference_no' => Arr::get($data, 'basic.reference_no'),
                    'notification_date' => Arr::get($data, 'basic.notification_date') ?: null,
                    'selection_mode' => Arr::get($data, 'basic.selection_mode', 'exam'),
                    'apply_mode' => Arr::get($data, 'basic.selection_mode') === 'interview' ? Arr::get($data, 'basic.apply_mode', 'online') : 'online',
                    'eligibility' => $data['eligibility'] ?? null,
                    'fees' => $data['fees'] ?? null,
                    'documents' => $data['documents'] ?? null,
                ]);

                $this->applyStatus($recruitment, $data['action'], $data['publish_at'] ?? null);
            }

            if ($recruitment->isWalkIn()) {
                // No application window: the notice stays open until the interview day.
                $recruitment->app_start = null;
                $recruitment->app_end = $recruitment->interview['date_to'] ?? $recruitment->interview['date'] ?? null;
            }

            $recruitment->save();

            if (! $locked) {
                $this->syncPosts($recruitment, $data['posts'] ?? []);
            }

            $this->logEvents($recruitment, $isNew, $locked, $data['action'] ?? null, $before, $adminId);

            return $recruitment;
        });
    }

    /** @return array<string, string> */
    private function snapshot(Recruitment $recruitment): array
    {
        return array_map(
            fn ($v) => is_array($v) ? json_encode($v) : (string) $v,
            $recruitment->only(['description', ...self::DATE_FIELDS, 'interview', 'advertisement_pdf', 'syllabus_pdf']),
        );
    }

    /** @return array<string, mixed>|null */
    private function interviewDetails(array $data, ?string $mode): ?array
    {
        $interview = array_filter((array) ($data['interview'] ?? []), fn ($v) => $v !== null && $v !== '');

        return $mode === 'interview' && $interview ? $interview : null;
    }

    private function applyStatus(Recruitment $recruitment, string $action, ?string $publishAt): void
    {
        match ($action) {
            'publish' => $recruitment->fill(['status' => Recruitment::PUBLISHED, 'published_at' => now(), 'publish_at' => null]),
            'schedule' => $recruitment->fill(['status' => Recruitment::SCHEDULED, 'publish_at' => $publishAt]),
            default => $recruitment->fill(['status' => Recruitment::DRAFT, 'publish_at' => null]),
        };
    }

    /** @param  list<array<string, mixed>>  $posts */
    private function syncPosts(Recruitment $recruitment, array $posts): void
    {
        $recruitment->posts()->delete();

        foreach (array_values($posts) as $i => $post) {
            $recruitment->posts()->create([
                'name' => $post['name'],
                'code' => $post['code'] ?? null,
                'monthly_salary' => $post['monthly_salary'] ?? null,
                'is_contractual' => (bool) ($post['is_contractual'] ?? false),
                'contract_duration' => $post['contract_duration'] ?? null,
                'contract_unit' => $post['contract_unit'] ?? null,
                'minimum_qualification' => $post['minimum_qualification'] ?? null,
                'preferable_qualification' => $post['preferable_qualification'] ?? null,
                'age_max' => $post['age_max'] ?? null,
                'experience_years' => $post['experience_years'] ?? null,
                'experience_criteria' => $post['experience_criteria'] ?? null,
                'reserved_for' => $post['reserved_for'] ?? null,
                'total_vacancies' => (int) ($post['total_vacancies'] ?? 0),
                'category_breakup' => $post['category_breakup'] ?? null,
                'horizontal' => $post['horizontal'] ?? null,
                'district_breakup' => $post['district_breakup'] ?? null,
                'sort' => $i,
            ]);
        }
    }

    /** @param  array<string, mixed>  $before */
    private function logEvents(Recruitment $recruitment, bool $isNew, bool $locked, ?string $action, array $before, int $adminId): void
    {
        $log = fn (string $type, ?array $meta = null) => RecruitmentEvent::create([
            'recruitment_id' => $recruitment->id,
            'admin_id' => $adminId,
            'type' => $type,
            'meta' => $meta,
        ]);

        if ($isNew) {
            $log('created');
        } elseif ($locked) {
            $after = $this->snapshot($recruitment);
            $changed = array_keys(array_filter($after, fn ($v, $k) => (string) $v !== (string) $before[$k], ARRAY_FILTER_USE_BOTH));

            if ($changed) {
                $log('edited', ['fields' => $changed]);
            }

            return;
        }

        if ($action === 'publish') {
            $log('published');
        } elseif ($action === 'schedule') {
            $log('scheduled', ['publish_at' => $recruitment->publish_at?->toIso8601String()]);
        }
    }

    private function deleteFile(?string $path): void
    {
        if ($path) {
            Storage::disk('public')->delete($path);
        }
    }
}
