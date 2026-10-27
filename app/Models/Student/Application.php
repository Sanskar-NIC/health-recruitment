<?php

namespace App\Models\Student;

use App\Models\Admin\Recruitment;
use App\Models\Admin\RecruitmentPost;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Application extends Model
{
    public const SUBMITTED = 'submitted';

    public const WITHDRAWN = 'withdrawn';

    protected $table = 'student.applications';

    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'snapshot' => 'array',
            'fee_amount' => 'decimal:2',
            'submitted_at' => 'datetime',
            'withdrawn_at' => 'datetime',
        ];
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Registration::class, 'student_id');
    }

    public function recruitment(): BelongsTo
    {
        return $this->belongsTo(Recruitment::class);
    }

    public function post(): BelongsTo
    {
        return $this->belongsTo(RecruitmentPost::class, 'recruitment_post_id');
    }

    public function isActive(): bool
    {
        return $this->status === self::SUBMITTED;
    }

    public static function numberFor(Registration $student, Recruitment $recruitment, RecruitmentPost $post): string
    {
        return sprintf('APP-%d-%d-%s', $recruitment->id, $post->id, substr($student->student_uuid, 0, 8));
    }
}
