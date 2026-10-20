<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('announcements', function (Blueprint $table) {
            $table->id();
            $table->string('recipient', 150);   // "To"
            $table->string('sender', 150);      // "From"
            $table->string('subject', 150);     // shown as "RE:"
            $table->text('body');
            $table->string('signature', 150);
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('published_at')->nullable()->index();

            $table->string('discord_status', 20)->default('not_sent');
            $table->timestamp('discord_attempted_at')->nullable();
            $table->timestamp('discord_sent_at')->nullable();
            $table->string('discord_error')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('announcements');
    }
};