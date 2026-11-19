<?php

use App\Models\ShelfLifeRule;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->boolean('is_guest')->default(false)->index();
            $table->boolean('email_reminders')->default(true);
        });

        Schema::table('ingredients', function (Blueprint $table): void {
            $table->unsignedInteger('stock_version')->default(0);
        });

        Schema::table('waste_records', function (Blueprint $table): void {
            $table->string('category_name')->nullable();
        });

        Schema::table('reminders', function (Blueprint $table): void {
            $table->date('expiry_date')->nullable();
            $table->dropUnique(['ingredient_id', 'reminder_type']);
            $table->unique(['ingredient_id', 'reminder_type', 'expiry_date'], 'reminders_ingredient_type_expiry_unique');
        });

        $locations = ['room_temperature', 'refrigerator', 'freezer'];
        $categories = [
            'Sayur' => [2, 7, 30], 'Buah' => [4, 10, 30], 'Daging' => [1, 3, 90],
            'Seafood' => [1, 2, 60], 'Susu' => [1, 5, 30], 'Telur' => [7, 21, 60],
            'Bumbu' => [30, 60, 90], 'Lainnya' => [5, 10, 30],
        ];
        $stamp = now();

        foreach ($categories as $category => $days) {
            DB::table('categories')->insertOrIgnore([
                'name' => $category, 'slug' => Str::slug($category), 'is_active' => true,
                'created_at' => $stamp, 'updated_at' => $stamp,
            ]);

            foreach ($locations as $index => $location) {
                DB::table('shelf_life_rules')->insertOrIgnore([
                    'ingredient_name' => $category, 'storage_location' => $location,
                    'estimated_days' => $days[$index], 'created_at' => $stamp, 'updated_at' => $stamp,
                ]);
            }
        }

        $wasteCategories = DB::table('ingredients')->join('categories', 'categories.id', '=', 'ingredients.category_id')
            ->whereColumn('ingredients.id', 'waste_records.ingredient_id')->select('categories.name')->limit(1);
        DB::table('waste_records')->whereNotNull('ingredient_id')->update(['category_name' => $wasteCategories]);

        $ingredients = DB::table('ingredients')->join('categories', 'categories.id', '=', 'ingredients.category_id')
            ->whereNull('estimated_expiry_date')->select('ingredients.*', 'categories.name as category_name')
            ->lazyById(500, 'ingredients.id', 'id');

        foreach ($ingredients as $food) {
            $location = ShelfLifeRule::storageKey($food->storage_location);
            $expiry = ShelfLifeRule::estimate($food->name, $food->category_name, $location, $food->purchase_date);
            DB::table('ingredients')->where('id', $food->id)->update([
                'estimated_expiry_date' => $expiry,
            ]);
        }
    }

    public function down(): void
    {
        DB::table('reminders')->whereNotNull('expiry_date')->delete();

        Schema::table('reminders', function (Blueprint $table): void {
            $table->dropUnique('reminders_ingredient_type_expiry_unique');
            $table->dropColumn('expiry_date');
            $table->unique(['ingredient_id', 'reminder_type']);
        });

        Schema::table('waste_records', function (Blueprint $table): void {
            $table->dropColumn('category_name');
        });

        Schema::table('ingredients', function (Blueprint $table): void {
            $table->dropColumn('stock_version');
        });

        DB::table('users')->where('is_guest', true)->delete();

        Schema::table('users', function (Blueprint $table): void {
            $table->dropIndex(['is_guest']);
            $table->dropColumn(['is_guest', 'email_reminders']);
        });
    }
};
