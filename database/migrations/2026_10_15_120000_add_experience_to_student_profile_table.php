<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('student.profile', function (Blueprint $table) {
            $table->jsonb('experience')->nullable()->after('other_details');
        });

        // "Experience" is now step 4, so qualifications/uploads shift from 4/5 to 5/6.
        $shift = fn (int $n) => $n >= 4 ? $n + 1 : $n;

        DB::table('student.profile')->get()->each(function ($row) use ($shift) {
            DB::table('student.profile')->where('id', $row->id)->update([
                'completed_steps' => json_encode(array_map($shift, json_decode($row->completed_steps, true) ?? [])),
                'current_step' => $shift($row->current_step),
                'status' => 'draft',
            ]);
        });
    }

    public function down(): void
    {
        Schema::table('student.profile', function (Blueprint $table) {
            $table->dropColumn('experience');
        });
    }
};
