<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

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
}
