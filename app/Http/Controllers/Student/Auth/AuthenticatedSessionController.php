<?php

namespace App\Http\Controllers\Student\Auth;

use App\Http\Controllers\Controller;
use App\Models\Student\Registration;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthenticatedSessionController extends Controller
{
    /**
     * Handle incoming student login request.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'identifier' => ['required', 'string'],
            'password' => ['required', 'string'],
            'remember' => ['nullable', 'boolean'],
        ]);

        $identifier = trim($request->input('identifier'));
        $password = $request->input('password');
        $remember = $request->boolean('remember');

        // Allow login by Registration Number OR Email
        $student = Registration::where('registration_no', $identifier)
            ->orWhere('email', strtolower($identifier))
            ->first();

        if (! $student || ! Hash::check($password, $student->password)) {
            throw ValidationException::withMessages([
                'identifier' => 'Invalid Registration No./Email or Password.',
            ]);
        }

        // Authenticate into the 'student' guard session
        Auth::guard('student')->login($student, $remember);

        // Regenerate session ID to prevent session fixation attacks
        $request->session()->regenerate();

        return redirect()->intended(route('student.dashboard'));
    }

    /**
     * Destroy authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('student')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login');
    }
}
