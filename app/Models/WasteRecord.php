<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WasteRecord extends Model
{
    protected $fillable = [
        'user_id',
        'ingredient_id',
        'ingredient_name',
        'quantity',
        'unit',
        'loss_amount',
        'waste_date',
        'reason',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'decimal:2',
            'loss_amount' => 'decimal:2',
            'waste_date' => 'date',
        ];
    }

    // Catatan waste dimiliki oleh satu User
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Catatan waste dapat terhubung dengan satu Ingredient
    public function ingredient(): BelongsTo
    {
        return $this->belongsTo(Ingredient::class);
    }
}
