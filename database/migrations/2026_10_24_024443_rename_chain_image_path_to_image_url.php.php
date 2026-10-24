<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('chain_of_command_entries', function (Blueprint $table) {
            $table->renameColumn('image_path', 'image_url');
        });

        // Old values were local storage paths, not URLs. They would render as broken images.
        DB::statement("UPDATE chain_of_command_entries SET image_url = NULL WHERE image_url IS NOT NULL AND image_url NOT LIKE 'https://%'");
    }

    public function down(): void
    {
        Schema::table('chain_of_command_entries', function (Blueprint $table) {
            $table->renameColumn('image_url', 'image_path');
        });
    }
};