<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $this->swap();
    }

    public function down(): void
    {
        $this->swap();
    }

    /** Qualifications and Experience trade places (steps 4 and 5); the swap is its own inverse. */
    private function swap(): void
    {
        $map = fn (int $n) => match ($n) {
            4 => 5,
            5 => 4,
            default => $n,
        };

        DB::table('student.profile')->get()->each(function ($row) use ($map) {
            DB::table('student.profile')->where('id', $row->id)->update([
                'completed_steps' => json_encode(array_values(array_unique(array_map($map, json_decode($row->completed_steps, true) ?? [])))),
                'current_step' => $map($row->current_step),
            ]);
        });
    }
};
