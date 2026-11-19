<?php

namespace App\Notifications;

use App\Models\Ingredient;
use App\Models\User;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class IngredientExpiring extends Notification
{
    public function __construct(private Ingredient $ingredient, private int $daysBefore) {}

    /** @return list<string> */
    public function via(User $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(User $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Pengingat masa simpan dari KELOLAIN')
            ->greeting('Halo, '.$notifiable->name.'!')
            ->line($this->ingredient->name.' diperkirakan mencapai batas masa simpan dalam '.$this->daysBefore.' hari.')
            ->line('Tanggal perkiraan: '.$this->ingredient->estimated_expiry_date?->format('d/m/Y').'.')
            ->action('Buka Inventaris', route('ingredients.index'))
            ->salutation('KELOLAIN');
    }
}
