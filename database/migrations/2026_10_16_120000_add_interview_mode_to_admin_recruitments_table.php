<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('admin.recruitments', function (Blueprint $table) {
            // exam = written exam & selection; interview = interview-only engagement.
            $table->string('selection_mode', 10)->default('exam')->after('description');
            // online = candidates apply on the portal; walk_in = notice only, candidates report in person.
            $table->string('apply_mode', 10)->default('online')->after('selection_mode');
            // { date, time, venue, instructions, documents_to_carry }
            $table->jsonb('interview')->nullable()->after('documents');
        });
    }

    public function down(): void
    {
        Schema::table('admin.recruitments', function (Blueprint $table) {
            $table->dropColumn(['selection_mode', 'apply_mode', 'interview']);
        });
    }
};
