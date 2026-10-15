<?php

use App\Http\Controllers\Admin\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\RecruitmentController;
use App\Http\Controllers\Admin\SectionController;
use App\Http\Middleware\PreventBackHistory;
use App\Support\Admin\AdminMenu;
use Illuminate\Support\Facades\Route;

Route::prefix('admin')->name('admin.')->group(function () {
    Route::middleware('guest:admin')->group(function () {
        Route::get('login', [AuthenticatedSessionController::class, 'create'])->name('login');
        Route::post('login', [AuthenticatedSessionController::class, 'store'])->name('login.store');
    });

    Route::middleware(['auth:admin', PreventBackHistory::class])->group(function () {
        Route::get('/', fn () => redirect()->route('admin.dashboard'));
        Route::get('dashboard', DashboardController::class)->name('dashboard');
        Route::post('logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');

        Route::prefix('recruitments')->name('recruitments.')->controller(RecruitmentController::class)->group(function () {
            Route::get('/', 'index')->name('index');
            Route::get('create', 'create')->name('create');
            Route::post('/', 'store')->name('store');

            Route::prefix('{recruitment}')->whereNumber('recruitment')->group(function () {
                Route::get('/', 'show')->name('show');
                Route::get('edit', 'edit')->name('edit');
                // POST (not PUT) because the form carries file uploads.
                Route::post('/', 'update')->name('update');
                Route::post('duplicate', 'duplicate')->name('duplicate');
                Route::post('extend', 'extend')->name('extend');
                Route::post('close', 'close')->name('close');
                Route::post('cancel', 'cancel')->name('cancel');
                Route::delete('/', 'destroy')->name('destroy');
            });
        });

        Route::get('{section}', SectionController::class)
            ->where('section', implode('|', array_map('preg_quote', array_keys(AdminMenu::SECTIONS))))
            ->name('section');
    });
});
