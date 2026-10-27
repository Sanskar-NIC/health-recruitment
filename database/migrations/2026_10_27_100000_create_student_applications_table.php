<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // One application per candidate per post of an advertisement.
        Schema::create('student.applications', function (Blueprint $table) {
            $table->id();
            $table->string('application_no')->unique();
            $table->foreignId('student_id')->constrained('student.registration')->cascadeOnDelete();
            $table->foreignId('recruitment_id')->constrained('admin.recruitments')->cascadeOnDelete();
            $table->foreignId('recruitment_post_id')->constrained('admin.recruitment_posts')->cascadeOnDelete();

            // submitted | withdrawn
            $table->string('status', 20)->default('submitted')->index();
            // Category the candidate applied under, frozen at submission.
            $table->string('category', 20);
            $table->decimal('fee_amount', 8, 2)->default(0);
            // not_required | pending | paid
            $table->string('fee_status', 20)->default('not_required');
            // Eligibility checks and key profile fields as they were when the candidate applied.
            $table->jsonb('snapshot')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('withdrawn_at')->nullable();
            $table->timestamps();

            $table->unique(['student_id', 'recruitment_post_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student.applications');
    }
};
