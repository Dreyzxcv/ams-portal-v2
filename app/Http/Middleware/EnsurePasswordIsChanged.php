<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class EnsurePasswordIsChanged
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user === null || ! $user->force_password_change || $this->isAllowed($request)) {
            return $next($request);
        }

        Inertia::flash('toast', [
            'type' => 'error',
            'message' => __('You must change your temporary password before continuing.'),
        ]);

        return redirect()->route('security.edit');
    }

    private function isAllowed(Request $request): bool
    {
        // Password-confirmation routes live under user/*; they must stay reachable
        // because the security page asks for confirmation before it opens.
        return $request->routeIs('security.edit', 'user-password.update', 'logout')
            || $request->is('user/*', 'logout');
    }
}
