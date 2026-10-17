<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('batches', function (Blueprint $table) {
            $table->id();
            $table->string('legacy_id', 64)->nullable()->unique();
            $table->string('name', 100);
            $table->date('starts_on')->nullable();
            $table->timestampsTz();
            $table->softDeletesTz();
        });

        // Batch names are unique ignoring case, among non-deleted batches.
        DB::statement('CREATE UNIQUE INDEX batches_name_lower_unique ON batches (lower(name)) WHERE deleted_at IS NULL');

        Schema::create('batch_assignments', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('batch_id');
            $table->unsignedBigInteger('user_id');
            $table->timestampTz('assigned_at')->useCurrent();
            $table->timestampTz('unassigned_at')->nullable();
            $table->unsignedBigInteger('assigned_by')->nullable();
            $table->timestampsTz();

            $table->foreign('batch_id')->references('id')->on('batches')->restrictOnDelete();
            $table->foreign('user_id')->references('id')->on('users')->restrictOnDelete();
            $table->foreign('assigned_by')->references('id')->on('users')->nullOnDelete();

            $table->index('batch_id');
            $table->index('user_id');
        });

        // A trainee can have at most one ACTIVE batch; past assignments are kept.
        DB::statement('CREATE UNIQUE INDEX batch_assignments_one_active_per_user ON batch_assignments (user_id) WHERE unassigned_at IS NULL');
        DB::statement('ALTER TABLE batch_assignments ADD CONSTRAINT batch_assignments_dates_check CHECK (unassigned_at IS NULL OR unassigned_at >= assigned_at)');
    }

    public function down(): void
    {
        Schema::dropIfExists('batch_assignments');
        Schema::dropIfExists('batches');
    }
};
