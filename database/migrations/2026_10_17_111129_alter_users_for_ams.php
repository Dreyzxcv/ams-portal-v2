<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Nullable for now: made NOT NULL in the authentication step, once the
            // user factory and login form use usernames.
            $table->string('username', 50)->nullable();
            $table->string('legacy_id', 64)->nullable()->unique();
            $table->string('role', 30)->default('trainee')->index();
            $table->string('status', 20)->default('active')->index();
            $table->boolean('force_password_change')->default(false);
            $table->timestampTz('last_login_at')->nullable();
            $table->softDeletesTz();
        });

        // Users may have no email (V1 had users without one); they activate via an admin-issued link.
        DB::statement('ALTER TABLE users ALTER COLUMN email DROP NOT NULL');

        // Replace the case-sensitive email unique key with a case-insensitive one.
        DB::statement('ALTER TABLE users DROP CONSTRAINT IF EXISTS users_email_unique');
        DB::statement('DROP INDEX IF EXISTS users_email_unique');
        DB::statement('CREATE UNIQUE INDEX users_email_lower_unique ON users (lower(email)) WHERE email IS NOT NULL');
        DB::statement('CREATE UNIQUE INDEX users_username_lower_unique ON users (lower(username)) WHERE username IS NOT NULL');

        DB::statement("ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('admin','head_instructor','instructor','logistic_officer','trainee'))");
        DB::statement("ALTER TABLE users ADD CONSTRAINT users_status_check CHECK (status IN ('active','inactive','suspended'))");
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE users DROP CONSTRAINT IF EXISTS users_status_check');
        DB::statement('ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check');
        DB::statement('DROP INDEX IF EXISTS users_username_lower_unique');
        DB::statement('DROP INDEX IF EXISTS users_email_lower_unique');

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'username', 'legacy_id', 'role', 'status',
                'force_password_change', 'last_login_at', 'deleted_at',
            ]);
        });

        // Fails if rows with NULL email exist; fix the data before rolling back.
        DB::statement('ALTER TABLE users ALTER COLUMN email SET NOT NULL');
        DB::statement('ALTER TABLE users ADD CONSTRAINT users_email_unique UNIQUE (email)');
    }
};
