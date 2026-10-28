<?php

namespace App\Http\Controllers\Student\Auth;

use App\Http\Controllers\Controller;
use App\Models\Student\Registration;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;

class PasswordResetController extends Controller
{
    /** Demo-only OTP; replace with a real SMS/email OTP before going live. */
    private const DEMO_OTP = '123456';

    /**
     * Step 1: "send" the OTP. The response is identical whether or not the
     * account exists, so this cannot be used to enumerate students.
     */
    public function sendOtp(Request $request): RedirectResponse
    {
        $data = $request->validate(['identifier' => ['required', 'string']]);

        $request->session()->put('password_reset.identifier', trim($data['identifier']));

        return back()->with('otp_sent', true);
    }

    /**
     * Step 2: verify the OTP and set the new password.
     */
    public function reset(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'otp' => ['required', 'digits:6'],
            'password' => ['required', 'string', Password::min(8)->mixedCase()->numbers()->symbols(), 'same:confirm'],
            'confirm' => ['required', 'string'],
        ]);

        $identifier = $request->session()->get('password_reset.identifier');
        $student = $identifier ? $this->findStudent($identifier) : null;

        if (! $student || ! hash_equals(self::DEMO_OTP, $data['otp'])) {
            throw ValidationException::withMessages(['otp' => 'Invalid OTP.']);
        }

        $student->forceFill(['password' => $data['password']])->save();

        $request->session()->forget('password_reset.identifier');

        return redirect('/login')->with('status', 'Password reset successfully. Please log in.');
    }

    private function findStudent(string $identifier): ?Registration
    {
        return Registration::where('registration_no', $identifier)
            ->orWhere('email', strtolower($identifier))
            ->orWhere('mobile', $identifier)
            ->first();
    }
}
