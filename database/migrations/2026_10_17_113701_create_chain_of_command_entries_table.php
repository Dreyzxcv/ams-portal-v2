<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('chain_of_command_entries', function (Blueprint $table) {
            $table->id();
            $table->string('legacy_id', 64)->nullable()->unique();
            $table->string('name', 150);
            $table->string('rank', 100);
            $table->string('position', 150);
            $table->text('note')->nullable();
            $table->string('image_path', 500)->nullable(); // stored file path, not a remote URL
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestampsTz();

            $table->index('sort_order');
        });

        DB::statement('ALTER TABLE chain_of_command_entries ENABLE ROW LEVEL SECURITY');
    }

    public function down(): void
    {
        Schema::dropIfExists('chain_of_command_entries');
    }
};
