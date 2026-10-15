<?php

namespace App\Http\Controllers\Student\Auth;

use App\Http\Controllers\Controller;
use App\Models\Student\Registration;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

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

        // Students with an unfinished profile are taken straight to it.
        if ($student->profile?->status !== 'completed') {
            // One-shot flag: the portal layout shows a timed "profile incomplete" modal.
            $request->session()->flash('profile_notice', true);

            return redirect()->route('student.profile.show');
        }

        return redirect()->intended(route('student.dashboard'));
    }

    /**
     * Destroy authenticated session.
     */
    public function destroy(Request $request): Response|RedirectResponse
    {
        Auth::guard('student')->logout();

        // Wipe all session data, issue a new session id and CSRF token.
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        // Hard redirect so no authenticated page props survive in the browser.
        return Inertia::location(route('home'));
    }
}
