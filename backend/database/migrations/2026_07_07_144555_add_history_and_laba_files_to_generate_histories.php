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
            $table->string('ssa_simpanan_hist_filename')->nullable()->after('ssa_pinjaman_filename');
            $table->string('ssa_pinjaman_hist_filename')->nullable()->after('ssa_simpanan_hist_filename');
            $table->string('file_laba_filename')->nullable()->after('ssa_pinjaman_hist_filename');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('generate_histories', function (Blueprint $table) {
            $table->dropColumn([
                'ssa_simpanan_hist_filename',
                'ssa_pinjaman_hist_filename',
                'file_laba_filename'
            ]);
        });
    }
};
