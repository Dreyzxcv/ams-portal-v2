<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('trainee_profiles', function (Blueprint $table) {
            $table->unsignedBigInteger('user_id')->primary();
            $table->string('lifecycle', 20)->default('active')->index();
            $table->date('graduated_on')->nullable();
            $table->date('discharged_on')->nullable();
            $table->text('notes')->nullable();
            $table->timestampsTz();

            $table->foreign('user_id')->references('id')->on('users')->restrictOnDelete();
        });

        DB::statement("ALTER TABLE trainee_profiles ADD CONSTRAINT trainee_profiles_lifecycle_check CHECK (lifecycle IN ('active','graduated','discharged'))");
    }

    public function down(): void
    {
        Schema::dropIfExists('trainee_profiles');
    }
};
