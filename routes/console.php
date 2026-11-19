<?php

use App\Models\Ingredient;
use App\Models\Reminder;
use App\Models\TeamInvitation;
use App\Models\User;
use App\Notifications\IngredientExpiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Schedule::call(function () {
    TeamInvitation::query()
        ->whereNotNull('expires_at')
        ->where('expires_at', '<', now())
        ->delete();
})->daily()->description('Delete expired team invitations');

Artisan::command('kelolain:reminders', function (): int {
    if (! config('kelolain.email_enabled')) {
        $this->info('Pengiriman email belum diaktifkan.');

        return 0;
    }

    $failed = 0;
    foreach ([2, 1] as $daysBefore) {
        $date = today()->addDays($daysBefore)->toDateString();
        $ingredients = Ingredient::query()
            ->whereDate('estimated_expiry_date', $date)
            ->whereHas('user', fn ($query) => $query->where('is_guest', false)->where('email_reminders', true))
            ->with('user')
            ->lazyById();

        foreach ($ingredients as $ingredient) {
            $key = [
                'ingredient_id' => $ingredient->id,
                'expiry_date' => $date,
                'reminder_type' => 'h-'.$daysBefore,
            ];
            $claim = Reminder::query()->insertOrIgnore([
                ...$key, 'user_id' => $ingredient->user_id, 'scheduled_at' => today(),
                'status' => 'sending', 'created_at' => now(), 'updated_at' => now(),
            ]);
            if (! $claim) {
                continue;
            }

            try {
                $ingredient->user->notifyNow(new IngredientExpiring($ingredient, $daysBefore));
            } catch (Throwable $error) {
                Reminder::query()->where($key)->delete();
                report($error);
                $failed++;

                continue;
            }
            Reminder::query()->where($key)->update(['status' => 'sent', 'sent_at' => now()]);
        }
    }

    return $failed ? 1 : 0;
})->purpose('Mengirim email H-2 dan H-1 sesuai estimasi masa simpan.');

Artisan::command('kelolain:prune-guests', function (): void {
    User::query()->where('is_guest', true)->where('updated_at', '<', now()->subDays(7))->delete();
})->purpose('Menghapus data tamu yang tidak lagi aktif.');

Schedule::command('kelolain:reminders')->hourly()->withoutOverlapping(55);
Schedule::command('kelolain:prune-guests')->dailyAt('03:00')->withoutOverlapping();
