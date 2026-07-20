<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('rkas', function (Blueprint $table) {
            $table->string('target_nominal')->nullable()->change();
        });
    }

    public function down()
    {
        Schema::table('rkas', function (Blueprint $table) {
            $table->decimal('target_nominal', 20, 6)->nullable()->change();
        });
    }
};
