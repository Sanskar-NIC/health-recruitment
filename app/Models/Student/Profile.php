<?php

namespace App\Models\Student;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Profile extends Model
{
    protected $table = 'student.profile';

    protected $fillable = [
        'student_id',
        'student_uuid',
        'registration_no',
        'personal',
        'address',
        'other_details',
        'experience',
        'qualifications',
        'uploads',
        'completed_steps',
        'current_step',
        'status',
        'submitted_at',
    ];

    protected function casts(): array
    {
        return [
            'personal' => 'array',
            'address' => 'array',
            'other_details' => 'array',
            'experience' => 'array',
            'qualifications' => 'array',
            'uploads' => 'array',
            'completed_steps' => 'array',
            'current_step' => 'integer',
            'submitted_at' => 'datetime',
        ];
    }

    public function registration(): BelongsTo
    {
        return $this->belongsTo(Registration::class, 'student_id');
    }
}
