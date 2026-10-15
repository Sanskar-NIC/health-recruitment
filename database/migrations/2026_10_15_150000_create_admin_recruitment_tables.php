<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement('CREATE SCHEMA IF NOT EXISTS admin;');

        Schema::create('admin.recruitments', function (Blueprint $table) {
            $table->id();
            $table->string('advt_no')->unique();
            $table->string('title');
            $table->string('directorate')->nullable();
            $table->string('reference_no')->nullable();
            $table->date('notification_date')->nullable();
            $table->text('description')->nullable();

            // draft | scheduled | published | closed | cancelled
            $table->string('status', 20)->default('draft')->index();
            $table->timestamp('publish_at')->nullable();
            $table->timestamp('published_at')->nullable();
            $table->timestamp('closed_at')->nullable();
            $table->text('status_reason')->nullable();

            $table->date('app_start')->nullable();
            $table->date('app_end')->nullable();
            $table->date('fee_last_date')->nullable();
            $table->date('correction_end')->nullable();
            $table->date('admit_card_date')->nullable();
            $table->date('exam_date')->nullable();
            $table->date('result_date')->nullable();

            $table->jsonb('eligibility')->nullable();
            $table->jsonb('fees')->nullable();
            $table->jsonb('documents')->nullable();

            $table->string('advertisement_pdf')->nullable();
            $table->string('syllabus_pdf')->nullable();

            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->timestamps();
        });

        Schema::create('admin.recruitment_posts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('recruitment_id')->constrained('admin.recruitments')->cascadeOnDelete();
            $table->string('name');
            $table->string('code')->nullable();
            $table->string('pay_level')->nullable();
            $table->string('group', 5)->nullable();
            $table->unsignedInteger('total_vacancies')->default(0);
            $table->jsonb('category_breakup')->nullable();
            $table->jsonb('horizontal')->nullable();
            $table->jsonb('district_breakup')->nullable();
            $table->unsignedSmallInteger('sort')->default(0);
            $table->timestamps();
        });

        Schema::create('admin.recruitment_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('recruitment_id')->constrained('admin.recruitments')->cascadeOnDelete();
            $table->unsignedBigInteger('admin_id')->nullable();
            // created | edited | published | scheduled | extended | closed | cancelled
            $table->string('type', 20);
            $table->text('reason')->nullable();
            $table->jsonb('meta')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('admin.recruitment_events');
        Schema::dropIfExists('admin.recruitment_posts');
        Schema::dropIfExists('admin.recruitments');
    }
};
