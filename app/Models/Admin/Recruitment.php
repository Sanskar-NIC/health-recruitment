<?php

namespace App\Models\Admin;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Recruitment extends Model
{
    public const DRAFT = 'draft';

    public const SCHEDULED = 'scheduled';

    public const PUBLISHED = 'published';

    public const CLOSED = 'closed';

    public const CANCELLED = 'cancelled';

    protected $table = 'admin.recruitments';

    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'notification_date' => 'date:Y-m-d',
            'app_start' => 'date:Y-m-d',
            'app_end' => 'date:Y-m-d',
            'fee_last_date' => 'date:Y-m-d',
            'correction_end' => 'date:Y-m-d',
            'admit_card_date' => 'date:Y-m-d',
            'exam_date' => 'date:Y-m-d',
            'result_date' => 'date:Y-m-d',
            'publish_at' => 'datetime',
            'published_at' => 'datetime',
            'closed_at' => 'datetime',
            'eligibility' => 'array',
            'fees' => 'array',
            'documents' => 'array',
            'interview' => 'array',
        ];
    }

    public function posts(): HasMany
    {
        return $this->hasMany(RecruitmentPost::class)->orderBy('sort');
    }

    public function events(): HasMany
    {
        return $this->hasMany(RecruitmentEvent::class)->latest('id');
    }

    /** Published/closed, or scheduled and already due. These are what candidates see. */
    public function scopeVisibleToPublic(Builder $query): Builder
    {
        return $query->where(function (Builder $q) {
            $q->whereIn('status', [self::PUBLISHED, self::CLOSED])
                ->orWhere(fn (Builder $s) => $s->where('status', self::SCHEDULED)->where('publish_at', '<=', now()));
        });
    }

    /** Core fields can no longer be changed once candidates can see the advertisement. */
    public function isLocked(): bool
    {
        return in_array($this->status, [self::PUBLISHED, self::CLOSED], true)
            || ($this->status === self::SCHEDULED && $this->publish_at?->isPast());
    }

    /** draft | scheduled | cancelled | upcoming | open | closing_soon | closed */
    public function displayStatus(): string
    {
        if ($this->status === self::SCHEDULED && ! $this->publish_at?->isPast()) {
            return self::SCHEDULED;
        }

        if (in_array($this->status, [self::DRAFT, self::CANCELLED], true)) {
            return $this->status;
        }

        if ($this->status === self::CLOSED || ($this->app_end && $this->app_end->lt(today()))) {
            return 'closed';
        }

        if ($this->app_start && $this->app_start->gt(today())) {
            return 'upcoming';
        }

        if ($this->app_end && today()->diffInDays($this->app_end) <= 3) {
            return 'closing_soon';
        }

        return 'open';
    }

    public function isInterview(): bool
    {
        return $this->selection_mode === 'interview';
    }

    public function isWalkIn(): bool
    {
        return $this->isInterview() && $this->apply_mode === 'walk_in';
    }

    public function totalVacancies(): int
    {
        return (int) $this->posts->sum('total_vacancies');
    }
}
