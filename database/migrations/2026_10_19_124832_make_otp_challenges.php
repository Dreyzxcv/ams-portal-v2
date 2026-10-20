<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement('ALTER TABLE otp_challenges DROP CONSTRAINT IF EXISTS otp_challenges_purpose_check');
        DB::statement("ALTER TABLE otp_challenges ADD CONSTRAINT otp_challenges_purpose_check CHECK (purpose IN ('login','password_reset','password_change','email_verification'))");
    }

    public function down(): void
    {
        DB::statement("DELETE FROM otp_challenges WHERE purpose = 'email_verification'");
        DB::statement('ALTER TABLE otp_challenges DROP CONSTRAINT IF EXISTS otp_challenges_purpose_check');
        DB::statement("ALTER TABLE otp_challenges ADD CONSTRAINT otp_challenges_purpose_check CHECK (purpose IN ('login','password_reset','password_change'))");
    }
};