<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */

    public function up(): void
    {
        Schema::create('reminders', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('ingredient_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->string('reminder_type', 10);
            $table->dateTime('scheduled_at');
            $table->dateTime('sent_at')->nullable();

            $table->string('status', 20)->default('pending');

            $table->timestamps();

            $table->unique([
                'ingredient_id',
                'reminder_type'
            ]);

            $table->index(['status', 'scheduled_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reminders');
    }
};
