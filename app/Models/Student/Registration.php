<?php

namespace App\Models\Student;

use Illuminate\Console\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Override;

class Registration extends Model
{
    use HasFactory;
    protected $table = 'student.registration';
    protected $fillable = [
        'registration_no',
        'full_name',
        'father_name',
        'mother_name',
        'dob',
        'gender',
        'category',
        'pwbd',
        'mobile',
        'email',
        'password',
        'declaration',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'dob' => 'date',
            'declaration' => 'boolean',
            'password' => 'hashed',
        ];
    }
}
