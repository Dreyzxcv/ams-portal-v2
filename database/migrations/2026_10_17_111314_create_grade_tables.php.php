<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('grade_components', function (Blueprint $table) {
            $table->id();
            $table->string('key', 40)->unique();
            $table->string('label', 150);
            $table->unsignedSmallInteger('sequence')->unique();
            $table->decimal('max_score', 5, 2);
            $table->decimal('pass_score', 5, 2);
            $table->boolean('is_final')->default(false);
            $table->boolean('active')->default(true);
            $table->timestampsTz();
        });

        DB::statement('ALTER TABLE grade_components ADD CONSTRAINT grade_components_scores_check CHECK (max_score > 0 AND pass_score >= 0 AND pass_score <= max_score)');

        Schema::create('grade_records', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('trainee_id');
            $table->unsignedBigInteger('component_id');
            // NULL = not yet entered. A real zero is stored as 0.
            $table->decimal('score', 5, 2)->nullable();
            $table->unsignedBigInteger('graded_by')->nullable();
            $table->timestampTz('graded_at')->nullable();
            $table->timestampsTz();

            $table->foreign('trainee_id')->references('id')->on('users')->restrictOnDelete();
            $table->foreign('component_id')->references('id')->on('grade_components')->restrictOnDelete();
            $table->foreign('graded_by')->references('id')->on('users')->nullOnDelete();

            $table->unique(['trainee_id', 'component_id']);
            $table->index('component_id');
        });

        // The upper bound (score <= component max) is validated in the application,
        // because a CHECK cannot reference another table.
        DB::statement('ALTER TABLE grade_records ADD CONSTRAINT grade_records_score_check CHECK (score IS NULL OR score >= 0)');

        Schema::create('grade_revisions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('grade_record_id');
            $table->decimal('old_score', 5, 2)->nullable();
            $table->decimal('new_score', 5, 2)->nullable();
            $table->unsignedBigInteger('changed_by')->nullable();
            $table->timestampTz('changed_at')->useCurrent();
            $table->text('reason')->nullable();

            // RESTRICT (not SET NULL): this table is append-only, so rows are never updated.
            $table->foreign('grade_record_id')->references('id')->on('grade_records')->restrictOnDelete();
            $table->foreign('changed_by')->references('id')->on('users')->restrictOnDelete();

            $table->index('grade_record_id');
            $table->index('changed_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('grade_revisions');
        Schema::dropIfExists('grade_records');
        Schema::dropIfExists('grade_components');
    }
};
