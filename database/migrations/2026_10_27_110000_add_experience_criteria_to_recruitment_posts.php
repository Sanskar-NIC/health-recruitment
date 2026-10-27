<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('admin.recruitment_posts', function (Blueprint $table) {
            // What the experience must be in, e.g. "Mental Health Work, preferable counselling".
            $table->string('experience_criteria', 500)->nullable()->after('experience_years');
        });
    }

    public function down(): void
    {
        Schema::table('admin.recruitment_posts', function (Blueprint $table) {
            $table->dropColumn('experience_criteria');
        });
    }
};
