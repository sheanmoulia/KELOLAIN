<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\GuestController;
use App\Http\Controllers\IngredientController;
use App\Http\Controllers\Teams\TeamInvitationController;
use App\Http\Controllers\WorkspaceController;
use App\Http\Controllers\WorkspaceProfileController;
use App\Http\Middleware\EnsureTeamMembership;
use App\Http\Middleware\EnsureWorkspace;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function (Request $request) {
    if ($request->user() || $request->session()->has('guest_workspace_id')) {
        return to_route('workspace.dashboard');
    }

    return Inertia::render('auth/login', [
        'canResetPassword' => Features::enabled(Features::resetPasswords()),
        'status' => $request->session()->get('status'),
    ]);
})->name('home');

Route::post('/guest', [GuestController::class, 'store'])->middleware('throttle:10,1')->block()->name('guest.store');
Route::delete('/guest', [GuestController::class, 'destroy'])->block()->name('guest.destroy');

Route::middleware(EnsureWorkspace::class)->group(function (): void {
    Route::get('/dashboard', [WorkspaceController::class, 'index'])->name('workspace.dashboard');
    Route::get('/ingredients', [WorkspaceController::class, 'index'])->name('ingredients.index');
    Route::get('/bahan', [WorkspaceController::class, 'index'])->name('workspace.ingredients');
    Route::get('/waste', [WorkspaceController::class, 'index'])->name('workspace.waste');
    Route::get('/risk', [WorkspaceController::class, 'index'])->name('workspace.risk');
    Route::get('/profil', [WorkspaceController::class, 'index'])->name('workspace.profile');

    Route::post('/ingredients', [IngredientController::class, 'store'])->name('ingredients.store');
    Route::match(['put', 'patch'], '/ingredients/{ingredient}', [IngredientController::class, 'update'])
        ->whereNumber('ingredient')->name('ingredients.update');
    Route::delete('/ingredients/{ingredient}', [IngredientController::class, 'destroy'])
        ->whereNumber('ingredient')->name('ingredients.destroy');
    Route::post('/ingredients/{ingredient}/{action}', [IngredientController::class, 'reduce'])
        ->whereNumber('ingredient')->whereIn('action', ['gunakan', 'buang'])->name('ingredients.reduce');
});

Route::patch('/profil', [WorkspaceProfileController::class, 'update'])->middleware('auth')->name('workspace.profile.update');

Route::prefix('{current_team}')
    ->middleware(['auth', 'verified', EnsureTeamMembership::class])
    ->group(function () {
        Route::get('dashboard', DashboardController::class)->name('dashboard');
    });

Route::middleware(['auth'])->group(function () {
    Route::post('invitations/{invitation}/accept', [TeamInvitationController::class, 'accept'])->name('invitations.accept');
    Route::delete('invitations/{invitation}', [TeamInvitationController::class, 'decline'])->name('invitations.decline');
});

require __DIR__.'/settings.php';
