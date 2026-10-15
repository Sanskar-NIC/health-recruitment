<?php

namespace App\Models\Student;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;

class Registration extends Authenticatable
{
    use HasFactory;

    protected $table = 'student.registration';

    protected $fillable = [
        'student_uuid',
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

    protected static function booted(): void
    {
        // Every student gets a stable, non-guessable public identifier.
        static::creating(function (self $student) {
            $student->student_uuid ??= (string) \Illuminate\Support\Str::uuid();
        });
    }

    public function profile(): HasOne
    {
        return $this->hasOne(Profile::class, 'student_id');
    }
}
