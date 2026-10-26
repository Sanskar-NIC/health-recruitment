<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // The master is a catalogue of posts and their defaults. Salary, seats and age change with every
        // notification, so they are entered per recruitment instead.
        Schema::table('admin.posts', function (Blueprint $table) {
            $table->dropColumn(['monthly_salary', 'total_posts', 'min_age', 'max_age', 'experience_age_limit', 'contract_duration', 'contract_unit']);
            $table->string('preferable_qualification', 500)->nullable()->after('minimum_qualification');
        });

        Schema::table('admin.recruitment_posts', function (Blueprint $table) {
            $table->string('minimum_qualification')->nullable()->after('contract_unit');
            $table->string('preferable_qualification', 500)->nullable()->after('minimum_qualification');
            $table->unsignedSmallInteger('age_max')->nullable()->after('preferable_qualification');
            $table->decimal('experience_years', 4, 1)->nullable()->after('age_max');
            // Contractual posts are advertised as e.g. "1 (ST)" instead of a full category roster.
            $table->string('reserved_for', 10)->nullable()->after('experience_years');
        });
    }

    public function down(): void
    {
        Schema::table('admin.recruitment_posts', function (Blueprint $table) {
            $table->dropColumn(['minimum_qualification', 'preferable_qualification', 'age_max', 'experience_years', 'reserved_for']);
        });

        Schema::table('admin.posts', function (Blueprint $table) {
            $table->dropColumn('preferable_qualification');
            $table->unsignedInteger('monthly_salary')->nullable();
            $table->unsignedInteger('total_posts')->default(0);
            $table->unsignedSmallInteger('min_age')->nullable();
            $table->unsignedSmallInteger('max_age')->nullable();
            $table->unsignedSmallInteger('experience_age_limit')->nullable();
            $table->unsignedSmallInteger('contract_duration')->nullable();
            $table->string('contract_unit', 10)->nullable();
        });
    }
};
