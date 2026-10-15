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
            $before = $recruitment->only(['description', ...self::DATE_FIELDS, 'advertisement_pdf', 'syllabus_pdf']);

            $recruitment->updated_by = $adminId;
            $recruitment->description = Arr::get($data, 'basic.description');

            foreach (self::DATE_FIELDS as $field) {
                $recruitment->{$field} = Arr::get($data, "dates.$field") ?: null;
            }

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
                    'eligibility' => $data['eligibility'] ?? null,
                    'fees' => $data['fees'] ?? null,
                    'documents' => $data['documents'] ?? null,
                ]);

                $this->applyStatus($recruitment, $data['action'], $data['publish_at'] ?? null);
            }

            $recruitment->save();

            if (! $locked) {
                $this->syncPosts($recruitment, $data['posts'] ?? []);
            }

            $this->logEvents($recruitment, $isNew, $locked, $data['action'] ?? null, $before, $adminId);

            return $recruitment;
        });
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
                'pay_level' => $post['pay_level'] ?? null,
                'group' => $post['group'] ?? null,
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
            $after = $recruitment->only(array_keys($before));
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
