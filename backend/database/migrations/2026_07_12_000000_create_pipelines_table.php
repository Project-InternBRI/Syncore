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
        Schema::create('pipelines', function (Blueprint $table) {
            $table->id();
            $table->string('tahun');
            $table->string('bulan')->nullable();
            $table->string('type')->nullable(); // KC, KCP, Unit
            $table->string('branch_name');
            $table->string('kategori');
            $table->decimal('w1', 20, 2)->default(0);
            $table->decimal('w2', 20, 2)->default(0);
            $table->decimal('w3', 20, 2)->default(0);
            $table->decimal('w4', 20, 2)->default(0);
            $table->decimal('gap_harian', 20, 2)->default(0);
            $table->text('deskripsi')->nullable();
            $table->string('created_by')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pipelines');
    }
};
