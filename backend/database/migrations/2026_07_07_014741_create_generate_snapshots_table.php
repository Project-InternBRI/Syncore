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
        Schema::create('generate_snapshots', function (Blueprint $table) {
            $table->id();
            $table->foreignId('generate_history_id')->constrained('generate_histories')->onDelete('cascade');
            $table->enum('snapshot_type', ['dashboard_kc', 'dashboard_kcp', 'dashboard_unit', 'monitoring_produk']);
            $table->jsonb('snapshot_data');
            $table->timestamps();

            // Indexes
            $table->index(['generate_history_id', 'snapshot_type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('generate_snapshots');
    }
};
