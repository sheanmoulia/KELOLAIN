<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Ingredient extends Model
{
    protected $fillable = [
        'user_id',
        'category_id',
        'name',
        'quantity',
        'unit',
        'price',
        'purchase_date',
        'storage_location',
        'estimated_expiry_date',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'decimal:2',
            'price' => 'decimal:2',
            'purchase_date' => 'date',
            'estimated_expiry_date' => 'date',
        ];
    }

    // Ingredient dimiliki oleh satu User
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Ingredient memiliki satu Category
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    // Ingredient dapat memiliki banyak Waste Records
    public function wasteRecords(): HasMany
    {
        return $this->hasMany(WasteRecord::class);
    }

    // Ingredient dapat memiliki banyak Reminders
    public function reminders(): HasMany
    {
        return $this->hasMany(Reminder::class);
    }
}
