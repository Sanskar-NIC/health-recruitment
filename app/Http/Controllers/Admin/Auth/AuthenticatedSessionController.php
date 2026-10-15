<?php

namespace App\Http\Controllers\Admin\Auth;

use App\Http\Controllers\Controller;
use App\Models\Admin\Admin;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('admin/auth/login');
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'username' => ['required', 'string'],
            'password' => ['required', 'string'],
            'remember' => ['nullable', 'boolean'],
        ]);

        $username = Str::lower(trim($request->input('username')));
        $throttleKey = $username.'|'.$request->ip();

        if (RateLimiter::tooManyAttempts($throttleKey, 5)) {
            throw ValidationException::withMessages([
                'username' => 'Too many attempts. Try again in '.RateLimiter::availableIn($throttleKey).' seconds.',
            ]);
        }

        $admin = Admin::where('username', $username)->orWhere('email', $username)->first();

        if (! $admin || ! Hash::check($request->input('password'), $admin->password)) {
            RateLimiter::hit($throttleKey);

            throw ValidationException::withMessages([
                'username' => 'Invalid username or password.',
            ]);
        }

        if (! $admin->is_active) {
            throw ValidationException::withMessages([
                'username' => 'This account has been deactivated.',
            ]);
        }

        RateLimiter::clear($throttleKey);

        // Keep the previous login so the dashboard can show "last login at…".
        $request->session()->put('admin_previous_login', [
            'at' => $admin->last_login_at?->toIso8601String(),
            'ip' => $admin->last_login_ip,
        ]);

        $admin->forceFill([
            'last_login_at' => now(),
            'last_login_ip' => $request->ip(),
        ])->save();

        Auth::guard('admin')->login($admin, $request->boolean('remember'));
        $request->session()->regenerate();

        return redirect()->intended(route('admin.dashboard'));
    }

    public function destroy(Request $request)
    {
        Auth::guard('admin')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Inertia::location(route('admin.login'));
    }
}
