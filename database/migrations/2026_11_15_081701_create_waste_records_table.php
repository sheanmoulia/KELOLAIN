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
        Schema::create('waste_records', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('ingredient_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete();

            // Snapshot data bahan saat dicatat terbuang
            $table->string('ingredient_name');
            $table->decimal('quantity', 10, 2);
            $table->string('unit', 30);

            // Nilai kerugian dalam rupiah
            $table->decimal('loss_amount', 12, 2)->default(0);

            $table->date('waste_date');
            $table->string('reason', 100);
            $table->text('notes')->nullable();

            $table->timestamps();

            $table->index(['user_id', 'waste_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('waste_records');
    }
};
