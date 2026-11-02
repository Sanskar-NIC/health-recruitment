<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('admin.exam_centres', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code', 20)->unique();
            $table->text('address');
            $table->string('city');
            $table->unsignedInteger('capacity');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Written-exam details and release switches, one row per recruitment.
        Schema::create('admin.recruitment_exams', function (Blueprint $table) {
            $table->id();
            $table->foreignId('recruitment_id')->unique()->constrained('admin.recruitments')->cascadeOnDelete();
            $table->date('exam_date')->nullable();
            $table->time('reporting_time')->nullable();
            $table->time('start_time')->nullable();
            $table->time('end_time')->nullable();
            $table->text('instructions')->nullable();
            $table->timestamp('admit_cards_released_at')->nullable();
            $table->timestamp('results_published_at')->nullable();
            $table->timestamps();
        });

        Schema::table('student.applications', function (Blueprint $table) {
            // Set when the department's shortlist marks the candidate for the written exam.
            $table->timestamp('shortlisted_at')->nullable();
            $table->foreignId('exam_centre_id')->nullable()->constrained('admin.exam_centres')->nullOnDelete();
            $table->string('roll_no', 30)->nullable()->unique();
            $table->decimal('marks_obtained', 7, 2)->nullable();
            $table->decimal('marks_total', 7, 2)->nullable();
            // Candidates on the final list are selected; everyone else shortlisted is not.
            $table->boolean('is_selected')->default(false);
        });
    }

    public function down(): void
    {
        Schema::table('student.applications', function (Blueprint $table) {
            $table->dropConstrainedForeignId('exam_centre_id');
            $table->dropColumn(['shortlisted_at', 'roll_no', 'marks_obtained', 'marks_total', 'is_selected']);
        });
        Schema::dropIfExists('admin.recruitment_exams');
        Schema::dropIfExists('admin.exam_centres');
    }
};
