<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Fortify\Features;

class AuthenticatedSessionController extends Controller
{
    /**
     * Show the login page.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('auth/login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        // Validate the incoming request using the Fortify-style form request
        $user = $request->validateCredentials();

        // Do not allow blocked users to log in
        if ($user->is_blocked ?? false) {
            return back()
                ->withErrors(['email' => __('Jūsų paskyra yra užblokuota.')])
                ->withInput($request->only('email'));
        }

        // Attempt to authenticate using the JWT api guard
        // We re-use the validated user credentials instead of the session guard.
        $credentials = [
            'email' => $user->email,
            'password' => $request->input('password'),
        ];

        if (! $token = auth()->guard('api')->attempt($credentials)) {
            return back()
                ->withErrors(['email' => __('auth.failed')])
                ->withInput($request->only('email', 'remember'));
        }

        // Issue the JWT as an HTTP-only cookie so subsequent web and API
        // requests can be authenticated by the JWT guard.
        $minutes = config('jwt.ttl');
        $cookie = cookie(
            config('jwt.cookie_key_name', 'token'),
            $token,
            $minutes,
            path: '/',
            domain: null,
            secure: config('session.secure', false),
            httpOnly: true,
            raw: false,
            sameSite: config('session.same_site', 'lax')
        );

        return redirect()
            ->intended(route('dashboard', absolute: false))
            ->withCookie($cookie);
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        // Invalidate the current JWT (if present) and forget the cookie
        try {
            auth()->guard('api')->logout();
        } catch (\Throwable $e) {
            // If token is missing or already invalid, we can safely ignore.
        }

        $forgetCookie = cookie()->forget(config('jwt.cookie_key_name', 'token'));

        return redirect('/')->withCookie($forgetCookie);
    }
}
