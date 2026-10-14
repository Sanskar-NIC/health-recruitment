<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Student\HomeController;
use App\Http\Controllers\Student\NotificationController;
use App\Http\Controllers\Student\PlaceholderController;
use App\Http\Controllers\Student\RecruitmentController;
use App\Http\Controllers\Teams\TeamInvitationController;
use App\Http\Middleware\EnsureTeamMembership;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Student\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Student\DashboardController as StudentDashboardController;


Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('recruitments', [RecruitmentController::class, 'index'])->name('recruitments.index');
Route::get('notifications', [NotificationController::class, 'index'])->name('notifications.index');
Route::inertia('register', 'student/auth/register')->middleware('guest')->name('register');

Route::controller(PlaceholderController::class)->group(function () {
    Route::get('results', '__invoke')->defaults('title', 'Results')->name('results.index');
    Route::get('admit-card', '__invoke')->defaults('title', 'Admit Card')->name('admit-card');
    Route::get('answer-keys', '__invoke')->defaults('title', 'Answer Keys')->name('answer-keys');
    Route::get('faq', '__invoke')->defaults('title', 'FAQ')->name('faq');
    Route::get('contact', '__invoke')->defaults('title', 'Contact')->name('contact');
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

// Student Guest Routes
Route::middleware('guest:student')->group(function () {
    Route::post('login', [AuthenticatedSessionController::class, 'store'])->name('student.login');
});

// Student Protected Routes (Login Only)
Route::middleware('auth:student')->group(function () {
    Route::get('student/dashboard', StudentDashboardController::class)->name('student.dashboard');
    Route::post('logout', [AuthenticatedSessionController::class, 'destroy'])->name('student.logout');
});


require __DIR__ . '/settings.php';
