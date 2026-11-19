<?php

use App\Models\Ingredient;
use App\Models\User;
use App\Notifications\IngredientExpiring;
use Illuminate\Support\Facades\Notification;
use Inertia\Testing\AssertableInertia as Assert;

function kelolainIngredient(array $overrides = []): array
{
    return [
        'name' => 'Wortel',
        'category' => 'Sayur',
        'qty' => '10',
        'unit' => 'gr',
        'price' => '20000',
        'buyDate' => today()->toDateString(),
        'storage' => 'Kulkas',
        ...$overrides,
    ];
}

test('each guest has an isolated workspace and can destroy only their own session data', function () {
    $this->get('/dashboard')->assertRedirect('/login');
    $this->post('/guest')->assertRedirect('/dashboard');
    $this->assertGuest();

    $firstOwner = session('guest_workspace_id');
    $firstIngredient = User::findOrFail($firstOwner)->ingredients()->firstOrFail();

    $this->get('/dashboard')->assertInertia(fn (Assert $page) => $page
        ->component('dashboard')->where('owner.isGuest', true)->where('owner.email', null)->has('foods', 6));

    $this->flushSession()->post('/guest')->assertRedirect('/dashboard');
    $secondOwner = session('guest_workspace_id');
    expect($secondOwner)->not->toBe($firstOwner);

    $this->delete("/ingredients/{$firstIngredient->id}")->assertNotFound();
    $this->delete('/guest')->assertRedirect('/login');

    $this->assertDatabaseMissing('users', ['id' => $secondOwner]);
    $this->assertDatabaseHas('ingredients', ['id' => $firstIngredient->id, 'user_id' => $firstOwner]);
});

test('Fortify registration creates an account with its own empty inventory and personal team', function () {
    $this->post('/register', [
        'name' => 'Dina',
        'email' => 'dina@example.com',
        'password' => 'Kelolain123!',
        'password_confirmation' => 'Kelolain123!',
    ])->assertSessionHasNoErrors();

    $this->assertAuthenticated();
    $owner = User::query()->where('email', 'dina@example.com')->firstOrFail();
    expect($owner->personalTeam())->not->toBeNull();

    $this->get('/dashboard')->assertInertia(fn (Assert $page) => $page
        ->where('owner.isGuest', false)->where('owner.name', 'Dina')->has('foods', 0));
});

test('using and wasting partial stock reduce the saved value without duplicating waste', function () {
    $owner = User::factory()->create();
    $this->actingAs($owner)->from('/bahan')->post('/ingredients', kelolainIngredient())->assertSessionHasNoErrors();

    $food = $owner->ingredients()->firstOrFail();
    $url = "/ingredients/{$food->id}";
    expect($food->estimated_expiry_date->toDateString())->toBe(today()->addDays(7)->toDateString());
    $this->post("$url/gunakan", ['qty' => 2, 'version' => 0])->assertSessionHasNoErrors();

    $waste = ['qty' => 2, 'reason' => 'Busuk', 'date' => today()->toDateString(), 'version' => 1];
    $this->post("$url/buang", $waste)->assertSessionHasNoErrors();
    $this->post("$url/buang", $waste)->assertSessionHasErrors('version');

    expect($food->refresh()->quantity)->toBe('6.00')->and($food->price)->toBe('12000.00');
    expect($owner->wasteRecords()->sole()->loss_amount)->toBe('4000.00');
    $this->post("$url/buang", [...$waste, 'qty' => 6, 'version' => 2])->assertSessionHasNoErrors();

    expect(Ingredient::find($food->id))->toBeNull();
    expect($owner->wasteRecords()->sum('loss_amount'))->toEqual(16000);
    expect($owner->wasteRecords()->pluck('category_name')->all())->toBe(['Sayur', 'Sayur']);

    $this->actingAs(User::factory()->create())->get('/waste')
        ->assertInertia(fn (Assert $page) => $page->has('wastes', 0));
});

test('the scheduler sends one email on each of H-2 and H-1', function () {
    config(['kelolain.email_enabled' => true]);
    Notification::fake();
    $owner = User::factory()->create();
    $this->freezeTime();
    $this->actingAs($owner)->post('/ingredients', kelolainIngredient([
        'buyDate' => today()->subDays(5)->toDateString(),
    ]))->assertSessionHasNoErrors();

    $this->artisan('kelolain:reminders')->assertSuccessful();
    $this->artisan('kelolain:reminders')->assertSuccessful();
    $this->travel(1)->day();
    $this->artisan('kelolain:reminders')->assertSuccessful();
    $this->artisan('kelolain:reminders')->assertSuccessful();

    Notification::assertSentToTimes($owner, IngredientExpiring::class, 2);
    $this->assertDatabaseCount('reminders', 2);
    $this->assertDatabaseCount('waste_records', 0);
});
