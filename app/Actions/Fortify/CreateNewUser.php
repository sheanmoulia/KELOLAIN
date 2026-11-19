<?php

namespace App\Actions\Fortify;

use App\Actions\Teams\CreateTeam;
use App\Concerns\PasswordValidationRules;
use App\Concerns\ProfileValidationRules;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules, ProfileValidationRules;

    /** @param array<string, mixed> $input */
    public function create(array $input): User
    {
        $validated = Validator::make($input, [
            ...$this->profileRules(),
            'password' => [...$this->passwordRules(), 'max:72'],
        ])->validate();

        return DB::transaction(function () use ($validated): User {
            $user = User::create($validated);
            app(CreateTeam::class)->handle($user, $user->name, isPersonal: true);

            return $user;
        });
    }
}
