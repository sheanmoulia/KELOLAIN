<?php

namespace App\Models;

use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** @property CarbonImmutable $waste_date */
class WasteRecord extends Model
{
    protected $fillable = [
        'user_id',
        'ingredient_id',
        'ingredient_name',
        'category_name',
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
            'waste_date' => 'immutable_date',
        ];
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return BelongsTo<Ingredient, $this> */
    public function ingredient(): BelongsTo
    {
        return $this->belongsTo(Ingredient::class);
    }
}
