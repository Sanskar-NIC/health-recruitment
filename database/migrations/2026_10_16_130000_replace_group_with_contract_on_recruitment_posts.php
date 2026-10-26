<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('admin.recruitment_posts', function (Blueprint $table) {
            $table->dropColumn('group');
            // Copied from the Posts master when the post is picked.
            $table->boolean('is_contractual')->default(false)->after('monthly_salary');
            $table->unsignedSmallInteger('contract_duration')->nullable()->after('is_contractual');
            $table->string('contract_unit', 10)->nullable()->after('contract_duration');
        });
    }

    public function down(): void
    {
        Schema::table('admin.recruitment_posts', function (Blueprint $table) {
            $table->dropColumn(['is_contractual', 'contract_duration', 'contract_unit']);
            $table->string('group', 5)->nullable();
        });
    }
};
