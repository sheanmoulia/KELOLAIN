<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureWorkspace
{
    public function handle(Request $request, Closure $next): Response
    {
        $owner = $request->user();
        if (! $owner && $request->session()->has('guest_workspace_id')) {
            $owner = User::query()->where('is_guest', true)->whereKey($request->session()->get('guest_workspace_id'))->first();
            if ($owner?->updated_at?->lt(now()->subDay())) {
                $owner->touch();
            }
        }

        if (! $owner) {
            $request->session()->forget('guest_workspace_id');

            return redirect()->guest(route('login'));
        }

        $request->attributes->set('workspace_owner', $owner);

        return $next($request);
    }
}
