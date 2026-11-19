<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Ingredient;
use App\Models\ShelfLifeRule;
use App\Models\User;
use App\Models\WasteRecord;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Date;
use Inertia\Inertia;
use Inertia\Response;

class WorkspaceController extends Controller
{
    public function index(Request $request): Response
    {
        /** @var User $owner */
        $owner = $request->attributes->get('workspace_owner');
        $tab = match ($request->route()->getName()) {
            'ingredients.index', 'workspace.ingredients' => 'Bahan Saya',
            'workspace.waste' => 'Waste Tracker',
            'workspace.risk' => 'Risk Ranking',
            'workspace.profile' => 'Profil',
            default => 'Dashboard',
        };

        return Inertia::render($tab === 'Dashboard' ? 'dashboard' : 'Workspace', $this->props($owner, $tab));
    }

    /** @return array<string, mixed> */
    public function props(User $owner, string $tab): array
    {
        $today = today()->toImmutable();
        $locations = config('kelolain.storage');
        $foods = $owner->ingredients()->with('category')->latest('id')->get()->toBase()->map(function (Ingredient $food) use ($today, $locations): array {
            $category = $food->category->name;
            $buyDate = $food->purchase_date->toDateString();
            $storage = ShelfLifeRule::storageKey($food->storage_location);
            $expiry = $food->estimated_expiry_date;
            $expiry ??= Date::parse(ShelfLifeRule::estimate($food->name, $category, $storage, $buyDate));
            $daysLeft = (int) $today->diffInDays($expiry);
            $urgency = match (true) {
                $daysLeft <= 1 => 3,
                $daysLeft <= 3 => 2,
                default => 1,
            };

            return [
                'id' => $food->id,
                'version' => $food->stock_version,
                'name' => $food->name,
                'category' => $category,
                'qty' => (float) $food->quantity,
                'unit' => $food->unit,
                'price' => (float) $food->price,
                'buyDate' => $buyDate,
                'expiryDate' => $expiry->toDateString(),
                'storage' => $locations[$storage] ?? $food->storage_location,
                'daysLeft' => $daysLeft,
                'urgency' => $urgency,
                'riskScore' => (float) $food->price / max(1, $daysLeft),
                'icon' => config('kelolain.icons')[$category] ?? '📦',
            ];
        });

        $wastes = $owner->wasteRecords()->latest('waste_date')->latest('id')->get()->toBase()
            ->map(fn (WasteRecord $waste) => [
                'id' => $waste->id,
                'name' => $waste->ingredient_name,
                'category' => $waste->category_name ?? 'Lainnya',
                'qty' => (float) $waste->quantity,
                'unit' => $waste->unit,
                'loss' => (float) $waste->loss_amount,
                'date' => $waste->waste_date->toDateString(),
                'reason' => $waste->reason,
            ]);

        $riskOrder = $foods->sortBy(fn (array $food) => [
            -$food['urgency'], -$food['riskScore'], $food['daysLeft'], $food['id'],
        ])->pluck('id')->values();

        $shelf = ShelfLifeRule::all()->groupBy('ingredient_name')->map(fn ($rules) => $rules
            ->mapWithKeys(fn (ShelfLifeRule $rule) => [
                ($locations[$rule->storage_location] ?? $rule->storage_location) => $rule->estimated_days,
            ])
        );
        $categories = Category::query()->where('is_active', true)->orderBy('id')->pluck('name');

        return [
            'tab' => $tab,
            'foods' => $foods,
            'wastes' => $wastes,
            'riskOrder' => $riskOrder,
            'shelf' => $shelf,
            'categories' => $categories,
            'storageOptions' => array_values($locations),
            'units' => config('kelolain.units'),
            'reasons' => config('kelolain.reasons'),
            'today' => $today->toDateString(),
            'emailEnabled' => config('kelolain.email_enabled'),
            'owner' => [
                'name' => $owner->name,
                'email' => $owner->is_guest ? null : $owner->email,
                'isGuest' => $owner->is_guest,
                'emailReminders' => $owner->email_reminders,
                'joinedAt' => $owner->created_at?->toDateString() ?? $today->toDateString(),
            ],
        ];
    }
}
