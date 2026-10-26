<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('admin.posts', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code', 50)->unique();

            $table->boolean('experience_required')->default(false);
            $table->unsignedSmallInteger('experience_age_limit')->nullable();
            $table->string('experience_criteria', 500)->nullable();
            $table->decimal('experience_years', 4, 1)->nullable();

            // Posts are not on government pay scales: a single monthly salary, no pay level / grade pay.
            $table->unsignedInteger('monthly_salary')->nullable();
            $table->unsignedInteger('total_posts')->default(0);
            $table->string('minimum_qualification')->nullable();
            $table->unsignedSmallInteger('min_age')->nullable();
            $table->unsignedSmallInteger('max_age')->nullable();
            $table->boolean('is_contractual')->default(false);
            $table->boolean('is_active')->default(true)->index();

            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->timestamps();
        });

        Schema::table('admin.recruitment_posts', function (Blueprint $table) {
            $table->renameColumn('pay_level', 'monthly_salary');
        });
    }

    public function down(): void
    {
        Schema::table('admin.recruitment_posts', function (Blueprint $table) {
            $table->renameColumn('monthly_salary', 'pay_level');
        });

        Schema::dropIfExists('admin.posts');
    }
};
