<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('admin.posts', function (Blueprint $table) {
            // Only set for contractual posts. Unit: day | month | year.
            $table->unsignedSmallInteger('contract_duration')->nullable()->after('is_contractual');
            $table->string('contract_unit', 10)->nullable()->after('contract_duration');
        });
    }

    public function down(): void
    {
        Schema::table('admin.posts', function (Blueprint $table) {
            $table->dropColumn(['contract_duration', 'contract_unit']);
        });
    }
};
