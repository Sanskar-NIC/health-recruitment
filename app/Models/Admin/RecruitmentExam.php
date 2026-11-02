<?php

namespace App\Models\Admin;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RecruitmentExam extends Model
{
    protected $table = 'admin.recruitment_exams';

    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'exam_date' => 'date',
            'admit_cards_released_at' => 'datetime',
            'results_published_at' => 'datetime',
        ];
    }

    public function recruitment(): BelongsTo
    {
        return $this->belongsTo(Recruitment::class);
    }

    public static function forRecruitment(int $recruitmentId): self
    {
        return self::firstOrNew(['recruitment_id' => $recruitmentId]);
    }

    public function hasSchedule(): bool
    {
        return $this->exam_date !== null && $this->start_time !== null;
    }

    /** "09:30:00" -> "09:30 AM" */
    public static function clock(?string $time): ?string
    {
        return $time ? date('h:i A', strtotime($time)) : null;
    }
}
