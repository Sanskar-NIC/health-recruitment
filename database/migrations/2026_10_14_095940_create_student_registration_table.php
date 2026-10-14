<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{

    public function up(): void
    {
        Schema::create('student_registration', function (Blueprint $table) {
            $table->id();
            $table->string('registration_no')->unique();
            $table->string('father_name');
            $table->string('mother_name');
            $table->date('dob');
            $table->string('gender', 20);
            $table->string('category', 20);
            $table->string('pwbd', 10)->default('no');
            $table->string('mobile', 15)->unique();
            $table->string('email')->unique();
            $table->string('password');
            $table->boolean('declaration')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_registration');
    }
};
