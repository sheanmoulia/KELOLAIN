<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class WorkspaceProfileController
{
    public function update(Request $request): RedirectResponse
    {
        $owner = $request->user();
        if (is_string($email = $request->input('email'))) {
            $request->merge(['email' => Str::lower($email)]);
        }
        $emailChanged = $request->input('email') !== $owner->email;

        $input = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($owner)],
            'emailReminders' => ['required', 'boolean'],
            'current_password' => $emailChanged ? ['required', 'current_password:web'] : ['exclude'],
        ]);

        $owner->fill([
            'name' => $input['name'],
            'email' => $input['email'],
            'email_reminders' => $input['emailReminders'],
        ]);
        if ($emailChanged) {
            $owner->email_verified_at = null;
        }
        $owner->save();

        return back()->with('message', 'Profil berhasil diperbarui.');
    }
}
