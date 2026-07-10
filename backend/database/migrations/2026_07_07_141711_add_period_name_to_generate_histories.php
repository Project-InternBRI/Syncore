<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('generate_histories', function (Blueprint $table) {
            $table->string('period_name')->nullable()->after('period_year');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('generate_histories', function (Blueprint $table) {
            $table->dropColumn('period_name');
        });
    }
};
