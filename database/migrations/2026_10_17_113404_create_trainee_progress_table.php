<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('trainee_progress', function (Blueprint $table) {
            $table->unsignedBigInteger('trainee_id')->primary();
            // Upper bound is validated in the app until the phase model is confirmed.
            $table->unsignedSmallInteger('current_phase')->default(1);
            $table->date('started_on')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->timestampsTz();

            $table->foreign('trainee_id')->references('id')->on('users')->restrictOnDelete();
            $table->foreign('updated_by')->references('id')->on('users')->nullOnDelete();
        });

        // Remaining days are computed from rules, never stored.
        DB::statement('ALTER TABLE trainee_progress ADD CONSTRAINT trainee_progress_phase_check CHECK (current_phase >= 1)');
        DB::statement('ALTER TABLE trainee_progress ENABLE ROW LEVEL SECURITY');
    }

    public function down(): void
    {
        Schema::dropIfExists('trainee_progress');
    }
};
