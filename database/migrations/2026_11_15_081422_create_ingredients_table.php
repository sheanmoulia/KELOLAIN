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
        Schema::create('ingredients', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('category_id')
                ->constrained()
                ->restrictOnDelete();

            $table->string('name');
            $table->decimal('quantity', 10, 2);
            $table->string('unit', 30);
            $table->decimal('price', 12, 2)->default(0);

            $table->date('purchase_date');
            $table->string('storage_location', 30);
            $table->date('estimated_expiry_date')->nullable();

            $table->text('notes')->nullable();

            $table->timestamps();

            $table->index(['user_id', 'estimated_expiry_date']);
        });
    }


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ingredients');
    }
};
