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

    /** APP{year}{month}{2 digits}{3 letters}{registration serial}, e.g. APP20261042QXK000001. */
    public static function numberFor(Registration $student): string
    {
        // Registration numbers are HRP{year}{serial}; only the serial is repeated here.
        $serial = preg_replace('/^HRP\d{4}/', '', $student->registration_no);

        do {
            $number = sprintf(
                'APP%s%02d%s%s',
                now()->format('Ym'),
                random_int(0, 99),
                collect(range(1, 3))->map(fn () => chr(random_int(65, 90)))->implode(''),
                $serial,
            );
        } while (self::where('application_no', $number)->exists());

        return $number;
    }
}
