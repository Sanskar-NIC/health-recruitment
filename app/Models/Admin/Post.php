<?php

namespace App\Models\Admin;

use Illuminate\Database\Eloquent\Model;

/** Post master: the catalogue of posts the department recruits for, with default eligibility. */
class Post extends Model
{
    protected $table = 'admin.posts';

    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'experience_required' => 'boolean',
            'is_contractual' => 'boolean',
            'is_active' => 'boolean',
            'experience_years' => 'float',
        ];
    }
}
