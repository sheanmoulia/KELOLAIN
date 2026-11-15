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
        Schema::create('shelf_life_rules', function (Blueprint $table) {
            $table->id();
            $table->string('ingredient_name');
            $table->enum('storage_location', [
                'room_temperature',
                'refrigerator',
                'freezer'
            ]);
            $table->unsignedInteger('estimated_days');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->unique(['ingredient_name', 'storage_location']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shelf_life_rules');
    }
};
