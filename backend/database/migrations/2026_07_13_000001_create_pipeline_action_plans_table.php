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
        Schema::create('pipeline_action_plans', function (Blueprint $table) {
            $table->id();
            $table->string('tahun');
            $table->string('bulan');
            $table->string('branch_name');
            $table->string('kategori'); // the category (e.g. Total Tabungan)
            $table->string('nasabah');
            $table->decimal('nominal', 20, 2);
            $table->string('tanggal')->nullable();
            $table->string('week')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pipeline_action_plans');
    }
};
