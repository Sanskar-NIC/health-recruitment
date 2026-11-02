<?php

use App\Http\Controllers\Admin\ApplicationController;
use App\Http\Controllers\Admin\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\Exam\AdmitCardController;
use App\Http\Controllers\Admin\Exam\AllocationController;
use App\Http\Controllers\Admin\Exam\ExcelController;
use App\Http\Controllers\Admin\Exam\ResultController;
use App\Http\Controllers\Admin\Exam\ScheduleController;
use App\Http\Controllers\Admin\Exam\ShortlistController;
use App\Http\Controllers\Admin\ExamCentreController;
use App\Http\Controllers\Admin\PostController;
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

        Route::prefix('applications')->name('applications.')->controller(ApplicationController::class)->group(function () {
            Route::get('/', 'index')->name('index');
            Route::get('{application}', 'show')->whereNumber('application')->name('show');
            Route::post('{application}/reject', 'reject')->whereNumber('application')->name('reject');
            Route::get('{application}/file', 'file')->whereNumber('application')->name('file');
        });

        Route::post('excel/parse', ExcelController::class)->name('excel.parse');

        Route::prefix('exams')->name('exams.')->group(function () {
            Route::get('shortlisting', [ShortlistController::class, 'index'])->name('shortlisting');
            Route::post('shortlisting', [ShortlistController::class, 'save'])->name('shortlisting.save');

            Route::get('schedule', [ScheduleController::class, 'index'])->name('schedule');
            Route::post('schedule', [ScheduleController::class, 'save'])->name('schedule.save');

            Route::get('centres', [AllocationController::class, 'index'])->name('centres');
            Route::post('centres/auto', [AllocationController::class, 'auto'])->name('centres.auto');
            Route::post('centres/assign', [AllocationController::class, 'assign'])->name('centres.assign');

            Route::get('admit-cards', [AdmitCardController::class, 'index'])->name('admit-cards');
            Route::post('admit-cards/release', [AdmitCardController::class, 'release'])->name('admit-cards.release');
            Route::post('admit-cards/withdraw', [AdmitCardController::class, 'withdraw'])->name('admit-cards.withdraw');
            Route::get('admit-cards/{application}', [AdmitCardController::class, 'pdf'])->whereNumber('application')->name('admit-cards.pdf');
        });

        Route::prefix('results')->name('results.')->controller(ResultController::class)->group(function () {
            Route::get('/', 'index')->name('index');
            Route::post('/', 'save')->name('save');
            Route::post('publish', 'publish')->name('publish');
            Route::post('unpublish', 'unpublish')->name('unpublish');
        });

        Route::prefix('masters/exam-centres')->name('masters.exam-centres.')->controller(ExamCentreController::class)->group(function () {
            Route::get('/', 'index')->name('index');
            Route::post('/', 'store')->name('store');
            Route::put('{centre}', 'update')->name('update')->whereNumber('centre');
            Route::patch('{centre}/toggle', 'toggle')->name('toggle')->whereNumber('centre');
            Route::delete('{centre}', 'destroy')->name('destroy')->whereNumber('centre');
        });

        Route::prefix('masters/posts')->name('masters.posts.')->controller(PostController::class)->group(function () {
            Route::get('/', 'index')->name('index');
            Route::post('/', 'store')->name('store');
            Route::put('{post}', 'update')->name('update')->whereNumber('post');
            Route::patch('{post}/toggle', 'toggle')->name('toggle')->whereNumber('post');
            Route::delete('{post}', 'destroy')->name('destroy')->whereNumber('post');
        });

        Route::get('{section}', SectionController::class)
            ->where('section', implode('|', array_map('preg_quote', array_keys(AdminMenu::SECTIONS))))
            ->name('section');
    });
});
