<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Student\Registration;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class RegisterController extends Controller
{
    /**
     * Handle applicant registration into the student schema.
     */
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'fullName' => ['required', 'string', 'max:255'],
            'fatherName' => ['required', 'string', 'max:255'],
            'motherName' => ['required', 'string', 'max:255'],
            'dob' => ['required', 'date', 'before:today'],
            'gender' => ['required', 'string', Rule::in(['Male', 'Female', 'Transgender'])],
            'category' => ['required', 'string', Rule::in(['UR', 'SC', 'ST', 'OBC', 'EWS'])],
            'pwbd' => ['required', 'string', Rule::in(['yes', 'no'])],
            'mobile' => ['required', 'string', 'regex:/^[6-9]\d{9}$/', Rule::unique(Registration::class, 'mobile')],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique(Registration::class, 'email')],
            'password' => ['required', 'string', 'min:8'],
            'declaration' => ['required', 'boolean', 'accepted'],
        ]);

        $registration = DB::transaction(function () use ($validated) {
            $year = date('Y');
            $prefix = "HRP{$year}";

            // Fetch latest registration number for the current year with row lock
            $latest = Registration::where('registration_no', 'like', "{$prefix}%")
                ->orderByDesc('registration_no')
                ->lockForUpdate()
                ->value('registration_no');

            if ($latest && preg_match('/(\d{6})$/', $latest, $matches)) {
                $nextSeq = ((int) $matches[1]) + 1;
            } else {
                $nextSeq = 1;
            }

            $registrationNo = sprintf('%s%06d', $prefix, $nextSeq);

            return Registration::create([
                'registration_no' => $registrationNo,
                'full_name' => $validated['fullName'],
                'father_name' => $validated['fatherName'],
                'mother_name' => $validated['motherName'],
                'dob' => $validated['dob'],
                'gender' => $validated['gender'],
                'category' => $validated['category'],
                'pwbd' => $validated['pwbd'],
                'mobile' => $validated['mobile'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'declaration' => $validated['declaration'],
            ]);
        });

        return response()->json([
            'success' => true,
            'message' => 'Registration completed successfully.',
            'registration_no' => $registration->registration_no,
        ], 201);
    }
}
