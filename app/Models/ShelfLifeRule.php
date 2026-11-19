<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Date;

class ShelfLifeRule extends Model
{
    protected $fillable = [
        'ingredient_name',
        'storage_location',
        'estimated_days',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'estimated_days' => 'integer',
        ];
    }

    public static function storageKey(string $storage): string
    {
        $locations = config('kelolain.storage');

        $key = array_search($storage, $locations, true);

        return is_string($key) ? $key : $storage;
    }

    public static function estimate(string $name, string $category, string $storage, string $purchaseDate): string
    {
        $rules = self::query()->where('storage_location', $storage)
            ->whereIn('ingredient_name', [$name, $category])
            ->pluck('estimated_days', 'ingredient_name');
        $days = (int) ($rules[$name] ?? $rules[$category] ?? 5);

        return Date::parse($purchaseDate)->addDays($days)->toDateString();
    }
}
