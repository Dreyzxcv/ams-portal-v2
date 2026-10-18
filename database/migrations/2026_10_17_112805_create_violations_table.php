<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('violations', function (Blueprint $table) {
            $table->id();
            $table->string('legacy_id', 64)->nullable()->unique();
            $table->unsignedBigInteger('trainee_id');
            $table->unsignedBigInteger('issued_by')->nullable();
            // Snapshot for migrated V1 rows where the issuer name cannot be matched to a user.
            $table->string('issued_by_name', 100)->nullable();
            $table->date('occurred_on');
            $table->text('description');
            $table->timestampsTz();
            $table->softDeletesTz();
            $table->unsignedBigInteger('deleted_by')->nullable();

            $table->foreign('trainee_id')->references('id')->on('users')->restrictOnDelete();
            $table->foreign('issued_by')->references('id')->on('users')->nullOnDelete();
            $table->foreign('deleted_by')->references('id')->on('users')->nullOnDelete();

            $table->index(['trainee_id', 'occurred_on']);
        });

        DB::statement('ALTER TABLE violations ENABLE ROW LEVEL SECURITY');
    }

    public function down(): void
    {
        Schema::dropIfExists('violations');
    }
};
