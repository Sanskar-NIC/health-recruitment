<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Student\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Student\Auth\PasswordResetController;
use App\Http\Controllers\Student\ApplicationController;
use App\Http\Controllers\Student\DashboardController as StudentDashboardController;
use App\Http\Controllers\Student\HomeController;
use App\Http\Controllers\Student\NotificationController;
use App\Http\Controllers\Student\PlaceholderController;
use App\Http\Controllers\Student\ProfileController;
use App\Http\Controllers\Student\RecruitmentController;
use App\Http\Controllers\Teams\TeamInvitationController;
use App\Http\Middleware\EnsureTeamMembership;
use App\Http\Middleware\PreventBackHistory;
use App\Support\Student\ProfileOptions;
use Illuminate\Support\Facades\Route;

// Admin routes first so /admin/dashboard is not captured by the {current_team} routes below.
require __DIR__.'/admin.php';

Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('recruitments', [RecruitmentController::class, 'index'])->name('recruitments.index');
Route::get('recruitments/{recruitment}', [RecruitmentController::class, 'show'])->whereNumber('recruitment')->name('recruitments.show');
Route::get('notifications', [NotificationController::class, 'index'])->name('notifications.index');
Route::inertia('register', 'student/auth/register')->middleware('guest:student')->name('register');

Route::controller(PlaceholderController::class)->group(function () {
    Route::get('faq', '__invoke')->defaults('title', 'FAQ')->name('faq');
    Route::get('contact', '__invoke')->defaults('title', 'Contact')->name('contact');
});

// Student Guest Routes
Route::middleware('guest:student')->group(function () {
    Route::post('login', [AuthenticatedSessionController::class, 'store'])->name('student.login');
    Route::post('password/otp', [PasswordResetController::class, 'sendOtp'])->middleware('throttle:5,1')->name('student.password.otp');
    Route::post('password/reset', [PasswordResetController::class, 'reset'])->middleware('throttle:5,1')->name('student.password.reset');
});

// Student Protected Routes (Login Only)
Route::middleware(['auth:student', PreventBackHistory::class])->group(function () {
    Route::get('student/dashboard', StudentDashboardController::class)->name('student.dashboard');
    Route::post('logout', [AuthenticatedSessionController::class, 'destroy'])->name('student.logout');

    Route::controller(ApplicationController::class)->group(function () {
        Route::get('student/applications', 'index')->name('student.applications.index');
        Route::get('student/applications/{application}', 'show')->whereNumber('application')->name('student.applications.show');
        Route::get('student/applications/{application}/download', 'download')->whereNumber('application')->name('student.applications.download');
        Route::post('student/applications/{application}/withdraw', 'withdraw')->whereNumber('application')->name('student.applications.withdraw');
        Route::get('recruitments/{recruitment}/apply/{post}', 'create')->whereNumber(['recruitment', 'post'])->name('student.apply');
        Route::post('recruitments/{recruitment}/apply/{post}', 'store')->whereNumber(['recruitment', 'post'])->name('student.apply.store');
    });

    Route::prefix('student/profile')->name('student.profile.')->controller(ProfileController::class)->group(function () {
        Route::get('/', 'show')->name('show');
        Route::post('upload', 'upload')->name('upload');
        Route::get('file', 'file')->name('file');
        Route::post('submit', 'submit')->name('submit');
        Route::put('{step}', 'save')->whereIn('step', array_keys(ProfileOptions::STEPS))->name('save');
    });
});

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
