<?php

namespace App\Models;

use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property CarbonImmutable $purchase_date
 * @property CarbonImmutable|null $estimated_expiry_date
 */
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
        'stock_version',
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'decimal:2',
            'price' => 'decimal:2',
            'purchase_date' => 'immutable_date',
            'estimated_expiry_date' => 'immutable_date',
            'stock_version' => 'integer',
        ];
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return BelongsTo<Category, $this> */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /** @return HasMany<WasteRecord, $this> */
    public function wasteRecords(): HasMany
    {
        return $this->hasMany(WasteRecord::class);
    }

    /** @return HasMany<Reminder, $this> */
    public function reminders(): HasMany
    {
        return $this->hasMany(Reminder::class);
    }
}
