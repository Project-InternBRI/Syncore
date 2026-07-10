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
        Schema::create('generate_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('period_month', 2); // e.g. "07"
            $table->string('period_year', 4); // e.g. "2026"
            $table->timestamp('generated_at')->useCurrent();
            $table->string('ssa_simpanan_filename');
            $table->string('ssa_pinjaman_filename');
            $table->integer('total_kc')->default(0);
            $table->integer('total_kcp')->default(0);
            $table->integer('total_unit')->default(0);
            $table->integer('total_records')->default(0);
            $table->enum('status', ['success', 'failed', 'processing'])->default('processing');
            $table->text('error_message')->nullable();
            $table->timestamps();

            // Indexes for faster lookups
            $table->index(['user_id', 'period_year', 'period_month']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('generate_histories');
    }
};
