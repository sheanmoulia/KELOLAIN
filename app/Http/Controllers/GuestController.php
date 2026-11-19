<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\ShelfLifeRule;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class GuestController
{
    public function store(Request $request): RedirectResponse
    {
        if ($request->user() || User::query()->where('is_guest', true)->whereKey($request->session()->get('guest_workspace_id'))->exists()) {
            return to_route('workspace.dashboard');
        }

        $guest = DB::transaction(function (): User {
            $guest = User::create([
                'name' => 'Tamu',
                'email' => 'guest+'.Str::uuid().'@guest.kelolain.invalid',
                'password' => Str::random(64),
                'is_guest' => true,
                'email_reminders' => false,
            ]);
            $categories = Category::query()->pluck('id', 'name');

            $ingredients = [
                ['Daging Ayam', 'Daging', 500, 'gr', 25000, 2, 'Freezer'],
                ['Bayam', 'Sayur', 1, 'ikat', 5000, 5, 'Kulkas'],
                ['Apel', 'Buah', 4, 'buah', 12000, 3, 'Kulkas'],
                ['Susu UHT', 'Susu', 2, 'kotak', 18000, 1, 'Suhu ruang'],
                ['Bawang Merah', 'Bumbu', 250, 'gr', 9000, 4, 'Suhu ruang'],
                ['Udang', 'Seafood', 300, 'gr', 30000, 1, 'Kulkas'],
            ];

            foreach ($ingredients as [$name, $category, $qty, $unit, $price, $daysAgo, $storage]) {
                $date = today()->subDays($daysAgo)->toDateString();
                $location = ShelfLifeRule::storageKey($storage);
                $guest->ingredients()->create([
                    'name' => $name, 'category_id' => $categories[$category], 'quantity' => $qty, 'unit' => $unit,
                    'price' => $price, 'purchase_date' => $date, 'storage_location' => $location,
                    'estimated_expiry_date' => ShelfLifeRule::estimate($name, $category, $location, $date),
                ]);
            }

            $guest->wasteRecords()->createMany([
                ['ingredient_name' => 'Tomat', 'category_name' => 'Sayur', 'quantity' => 2, 'unit' => 'buah', 'loss_amount' => 8000,
                    'waste_date' => today()->subDays(7)->toDateString(), 'reason' => 'Busuk'],
                ['ingredient_name' => 'Pisang', 'category_name' => 'Buah', 'quantity' => 3, 'unit' => 'buah', 'loss_amount' => 12000,
                    'waste_date' => today()->subDays(12)->toDateString(), 'reason' => 'Terlalu matang'],
                ['ingredient_name' => 'Ikan', 'category_name' => 'Seafood', 'quantity' => 250, 'unit' => 'gr', 'loss_amount' => 22000,
                    'waste_date' => today()->subDays(19)->toDateString(), 'reason' => 'Bau tidak sedap'],
            ]);

            return $guest;
        });

        $request->session()->regenerate();
        $request->session()->put('guest_workspace_id', $guest->id);

        return to_route('workspace.dashboard');
    }

    public function destroy(Request $request): RedirectResponse
    {
        if (! $request->user()) {
            User::query()->where('is_guest', true)->whereKey($request->session()->get('guest_workspace_id'))->delete();
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        } else {
            $request->session()->forget('guest_workspace_id');
        }

        return to_route('login');
    }
}
