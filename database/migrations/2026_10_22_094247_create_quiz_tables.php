<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('quizzes', function (Blueprint $table) {
            $table->id();
            $table->string('grade_component_key', 40)->unique();
            $table->string('title', 150);
            $table->text('instructions');
            $table->unsignedSmallInteger('duration_minutes');
            $table->timestampsTz();

            $table->foreign('grade_component_key')->references('key')->on('grade_components')->restrictOnDelete();
        });

        DB::statement("ALTER TABLE quizzes ADD CONSTRAINT quizzes_eligible_component_check CHECK (grade_component_key IN ('phase_1', 'final_exam'))");

        Schema::create('quiz_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('quiz_id')->constrained()->restrictOnDelete();
            $table->string('type', 30);
            $table->text('prompt');
            $table->decimal('points', 7, 2);
            $table->json('options')->nullable();
            $table->unsignedSmallInteger('correct_option')->nullable();
            $table->unsignedSmallInteger('position');
            $table->timestampsTz();

            $table->unique(['quiz_id', 'position']);
        });

        DB::statement("ALTER TABLE quiz_questions ADD CONSTRAINT quiz_questions_type_check CHECK (type IN ('multiple_choice', 'paragraph'))");
        DB::statement('ALTER TABLE quiz_questions ADD CONSTRAINT quiz_questions_points_check CHECK (points > 0)');

        Schema::create('quiz_accesses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('quiz_id')->constrained()->restrictOnDelete();
            $table->foreignId('trainee_id')->constrained('users')->restrictOnDelete();
            $table->foreignId('granted_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestampTz('granted_at');
            $table->timestampTz('revoked_at')->nullable();
            $table->timestampsTz();

            $table->unique(['quiz_id', 'trainee_id']);
            $table->index(['trainee_id', 'revoked_at']);
        });

        Schema::create('quiz_attempts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('quiz_id')->constrained()->restrictOnDelete();
            $table->foreignId('trainee_id')->constrained('users')->restrictOnDelete();
            $table->timestampTz('started_at');
            $table->timestampTz('expires_at');
            $table->timestampTz('submitted_at')->nullable();
            $table->decimal('auto_score', 7, 2)->nullable();
            $table->decimal('manual_score', 7, 2)->nullable();
            $table->decimal('final_score', 5, 2)->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->restrictOnDelete();
            $table->timestampTz('reviewed_at')->nullable();
            $table->timestampsTz();

            $table->unique(['quiz_id', 'trainee_id']);
            $table->index(['submitted_at', 'expires_at']);
        });

        DB::statement('ALTER TABLE quiz_attempts ADD CONSTRAINT quiz_attempts_dates_check CHECK (expires_at > started_at AND (submitted_at IS NULL OR submitted_at >= started_at))');
        DB::statement('ALTER TABLE quiz_attempts ADD CONSTRAINT quiz_attempts_review_check CHECK ((reviewed_at IS NULL AND reviewed_by IS NULL AND final_score IS NULL) OR (reviewed_at IS NOT NULL AND reviewed_by IS NOT NULL AND final_score IS NOT NULL))');

        Schema::create('quiz_answers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('quiz_attempt_id')->constrained('quiz_attempts')->restrictOnDelete();
            $table->foreignId('quiz_question_id')->constrained('quiz_questions')->restrictOnDelete();
            $table->text('answer_text')->nullable();
            $table->unsignedSmallInteger('selected_option')->nullable();
            $table->decimal('auto_score', 7, 2)->nullable();
            $table->decimal('manual_score', 7, 2)->nullable();
            $table->timestampsTz();

            $table->unique(['quiz_attempt_id', 'quiz_question_id']);
        });

        foreach (['quizzes', 'quiz_questions', 'quiz_accesses', 'quiz_attempts', 'quiz_answers'] as $table) {
            DB::statement("ALTER TABLE {$table} ENABLE ROW LEVEL SECURITY");
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('quiz_answers');
        Schema::dropIfExists('quiz_attempts');
        Schema::dropIfExists('quiz_accesses');
        Schema::dropIfExists('quiz_questions');
        Schema::dropIfExists('quizzes');
    }
};
