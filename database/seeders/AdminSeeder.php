<?php

namespace Database\Seeders;

use App\Models\Admin\Admin;
use Illuminate\Database\Seeder;

class AdminSeeder extends Seeder
{
    /**
     * Seed a default department admin (change the password after first login).
     */
    public function run(): void
    {
        Admin::updateOrCreate(
            ['username' => 'admin'],
            [
                'name' => 'Department Admin',
                'email' => 'admin@example.com',
                'designation' => 'Recruitment Officer',
                'password' => 'Admin@12345',
                'is_active' => true,
            ],
        );
    }
}
