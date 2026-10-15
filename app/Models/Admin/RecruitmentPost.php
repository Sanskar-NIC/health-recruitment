<?php

namespace App\Models\Admin;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RecruitmentPost extends Model
{
    protected $table = 'admin.recruitment_posts';

    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'category_breakup' => 'array',
            'horizontal' => 'array',
            'district_breakup' => 'array',
        ];
    }

    public function recruitment(): BelongsTo
    {
        return $this->belongsTo(Recruitment::class);
    }
}
