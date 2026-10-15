<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // One draft row per student; each wizard step lives in its own JSONB column.
        Schema::create('student.profile', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')
                ->unique()
                ->constrained('student.registration')
                ->cascadeOnDelete();
            // Denormalised, immutable identity keys for easy lookups/exports.
            $table->uuid('student_uuid')->index();
            $table->string('registration_no')->index();
            $table->jsonb('personal')->nullable();
            $table->jsonb('address')->nullable();
            $table->jsonb('other_details')->nullable();
            $table->jsonb('qualifications')->nullable();
            $table->jsonb('uploads')->nullable();
            $table->jsonb('completed_steps')->default('[]');
            $table->unsignedSmallInteger('current_step')->default(1);
            $table->string('status', 20)->default('draft'); // draft | completed
            $table->timestamp('submitted_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student.profile');
    }
};
