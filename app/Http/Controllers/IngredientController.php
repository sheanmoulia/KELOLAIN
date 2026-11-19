<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Ingredient;
use App\Models\ShelfLifeRule;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class IngredientController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $this->owner($request)->ingredients()->create($this->ingredientData($request));

        return back()->with('message', 'Bahan berhasil ditambahkan.');
    }

    public function update(Request $request, int $ingredient): RedirectResponse
    {
        DB::transaction(function () use ($request, $ingredient): void {
            $food = $this->owner($request)->ingredients()->lockForUpdate()->findOrFail($ingredient);
            $this->checkStockVersion($request, $food);
            $food->update([
                ...$this->ingredientData($request, $food),
                'stock_version' => $food->stock_version + 1,
            ]);
        }, 3);

        return back()->with('message', 'Bahan berhasil diperbarui.');
    }

    public function destroy(Request $request, int $ingredient): RedirectResponse
    {
        $this->owner($request)->ingredients()->findOrFail($ingredient)->delete();

        return back()->with('message', 'Bahan dihapus.');
    }

    public function reduce(Request $request, int $ingredient, string $action): RedirectResponse
    {
        $owner = $this->owner($request);
        $wasting = $action === 'buang';
        $input = $request->validate([
            'qty' => ['required', 'numeric', 'decimal:0,2', 'min:0.01', 'max:99999999.99'],
            'reason' => $wasting ? ['required', Rule::in(config('kelolain.reasons'))] : ['exclude'],
            'date' => $wasting ? ['required', 'date_format:Y-m-d', 'before_or_equal:today'] : ['exclude'],
        ]);

        DB::transaction(function () use ($request, $owner, $ingredient, $wasting, $input): void {
            $food = $owner->ingredients()->with('category')->lockForUpdate()->findOrFail($ingredient);
            $this->checkStockVersion($request, $food);
            $used = (int) round((float) $input['qty'] * 100);
            $available = (int) round((float) $food->quantity * 100);
            if ($used > $available) {
                throw ValidationException::withMessages(['qty' => 'Jumlah melebihi stok yang tersedia.']);
            }

            $cost = round((float) $food->price * ($used / $available), 2);

            if ($wasting) {
                if ($input['date'] < $food->purchase_date->toDateString()) {
                    throw ValidationException::withMessages(['date' => 'Tanggal buang minimal sama dengan tanggal pembelian.']);
                }

                $owner->wasteRecords()->create([
                    'ingredient_id' => $food->id,
                    'ingredient_name' => $food->name,
                    'category_name' => $food->category->name,
                    'quantity' => $used / 100,
                    'unit' => $food->unit,
                    'loss_amount' => $cost,
                    'waste_date' => $input['date'],
                    'reason' => $input['reason'],
                ]);
            }

            if ($used === $available) {
                $food->delete();
            } else {
                $food->update([
                    'quantity' => ($available - $used) / 100,
                    'price' => round((float) $food->price - $cost, 2),
                    'stock_version' => $food->stock_version + 1,
                ]);
            }
        }, 3);

        return back()->with('message', $wasting
            ? 'Bahan masuk ke Waste Tracker.'
            : 'Stok bahan berhasil diperbarui.');
    }

    private function owner(Request $request): User
    {
        return $request->attributes->get('workspace_owner');
    }

    private function checkStockVersion(Request $request, Ingredient $food): void
    {
        $input = $request->validate(['version' => ['required', 'integer', 'min:0']]);
        if ((int) $input['version'] !== $food->stock_version) {
            throw ValidationException::withMessages([
                'version' => 'Stok baru saja berubah. Tutup formulir dan buka kembali.',
            ]);
        }
    }

    /** @return array<string, mixed> */
    private function ingredientData(Request $request, ?Ingredient $food = null): array
    {
        $categories = Category::query()->where(function ($query) use ($food): void {
            $query->where('is_active', true);
            if ($food) {
                $query->orWhere('id', $food->category_id);
            }
        })->pluck('id', 'name');
        $units = config('kelolain.units');
        if ($food) {
            $units[] = $food->unit;
        }

        $input = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'category' => ['required', Rule::in($categories->keys())],
            'qty' => ['required', 'numeric', 'decimal:0,2', 'min:0.01', 'max:99999999.99'],
            'unit' => ['required', Rule::in($units)],
            'price' => ['required', 'numeric', 'decimal:0,2', 'min:0', 'max:9999999999.99'],
            'buyDate' => ['required', 'date_format:Y-m-d', 'before_or_equal:today'],
            'storage' => ['required', Rule::in(config('kelolain.storage'))],
        ]);

        $storage = ShelfLifeRule::storageKey($input['storage']);

        return [
            'name' => $input['name'],
            'category_id' => $categories[$input['category']],
            'quantity' => $input['qty'],
            'price' => $input['price'],
            'unit' => $input['unit'],
            'purchase_date' => $input['buyDate'],
            'storage_location' => $storage,
            'estimated_expiry_date' => ShelfLifeRule::estimate($input['name'], $input['category'], $storage, $input['buyDate']),
        ];
    }
}
