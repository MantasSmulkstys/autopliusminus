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
        Schema::table('users', function (Blueprint $table) {
            $table->enum('role', ['guest', 'user', 'admin'])->default('user')->after('email');
            $table->integer('credits')->default(0)->after('role');
            $table->boolean('is_blocked')->default(false)->after('credits');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('role');
            $table->dropColumn('credits');
            $table->dropColumn('is_blocked');
        });
    }
};
