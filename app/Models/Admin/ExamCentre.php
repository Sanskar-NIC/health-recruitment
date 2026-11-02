<?php

namespace App\Models\Admin;

use Illuminate\Database\Eloquent\Model;

class ExamCentre extends Model
{
    protected $table = 'admin.exam_centres';

    protected $guarded = [];

    protected function casts(): array
    {
        return ['is_active' => 'boolean', 'capacity' => 'integer'];
    }
}
