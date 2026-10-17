<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->timestampTz('occurred_at')->useCurrent();
            $table->unsignedBigInteger('actor_id')->nullable(); // NULL for system events
            // Snapshots so history survives renames and role changes.
            $table->string('actor_username', 50)->nullable();
            $table->string('actor_role', 30)->nullable();
            $table->string('action', 80);
            $table->string('subject_type', 80)->nullable();
            $table->string('subject_id', 64)->nullable();
            $table->jsonb('details')->nullable(); // never passwords, OTPs or tokens
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();

            // RESTRICT: users are soft-deleted; a hard delete must not rewrite audit rows.
            $table->foreign('actor_id')->references('id')->on('users')->restrictOnDelete();

            $table->index('occurred_at');
            $table->index('actor_id');
            $table->index('action');
            $table->index(['subject_type', 'subject_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};
