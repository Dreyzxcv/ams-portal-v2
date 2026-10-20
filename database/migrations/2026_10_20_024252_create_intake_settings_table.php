<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Singleton row (id = 1) holding the public applicant-intake configuration.
        Schema::create('intake_settings', function (Blueprint $table) {
            $table->unsignedSmallInteger('id')->primary();
            $table->unsignedBigInteger('current_batch_id')->nullable();
            $table->string('status', 10)->default('closed');
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->timestampsTz();

            $table->foreign('current_batch_id')->references('id')->on('batches')->nullOnDelete();
            $table->foreign('updated_by')->references('id')->on('users')->nullOnDelete();
        });

        DB::statement('ALTER TABLE intake_settings ADD CONSTRAINT intake_settings_singleton_check CHECK (id = 1)');
        DB::statement("ALTER TABLE intake_settings ADD CONSTRAINT intake_settings_status_check CHECK (status IN ('open','closed'))");
        DB::statement('ALTER TABLE intake_settings ENABLE ROW LEVEL SECURITY');
    }

    public function down(): void
    {
        Schema::dropIfExists('intake_settings');
    }
};