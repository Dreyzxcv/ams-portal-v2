<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('otp_challenges', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->string('purpose', 30);
            $table->string('code_hash', 128);          // keyed hash, never the code itself
            $table->timestampTz('expires_at');
            $table->timestampTz('consumed_at')->nullable();
            $table->unsignedSmallInteger('attempts')->default(0);
            $table->string('ip_address', 45)->nullable();
            $table->timestampTz('created_at')->useCurrent();

            // Ephemeral rows: removed together with the user.
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();

            $table->index(['user_id', 'purpose', 'created_at']);
            $table->index('expires_at');
        });

        DB::statement("ALTER TABLE otp_challenges ADD CONSTRAINT otp_challenges_purpose_check CHECK (purpose IN ('login','password_reset','password_change'))");

        Schema::create('trusted_devices', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->char('token_hash', 64)->unique();  // hash of the cookie token
            $table->string('label', 100)->nullable();
            $table->text('user_agent')->nullable();
            $table->timestampTz('last_used_at')->nullable();
            $table->timestampTz('expires_at');
            $table->timestampTz('revoked_at')->nullable();
            $table->timestampTz('created_at')->useCurrent();

            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();

            $table->index('user_id');
        });

        DB::statement('ALTER TABLE otp_challenges ENABLE ROW LEVEL SECURITY');
        DB::statement('ALTER TABLE trusted_devices ENABLE ROW LEVEL SECURITY');
    }

    public function down(): void
    {
        Schema::dropIfExists('trusted_devices');
        Schema::dropIfExists('otp_challenges');
    }
};
