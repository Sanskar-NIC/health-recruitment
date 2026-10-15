<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('student.registration', function (Blueprint $table) {
            $table->uuid('student_uuid')->nullable()->after('id');
        });

        // Backfill existing students, then enforce uniqueness.
        DB::statement('UPDATE student.registration SET student_uuid = gen_random_uuid() WHERE student_uuid IS NULL');

        Schema::table('student.registration', function (Blueprint $table) {
            $table->uuid('student_uuid')->nullable(false)->unique()->change();
        });
    }

    public function down(): void
    {
        Schema::table('student.registration', function (Blueprint $table) {
            $table->dropColumn('student_uuid');
        });
    }
};
