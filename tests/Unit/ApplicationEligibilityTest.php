<?php

use App\Models\Admin\Recruitment;
use App\Models\Admin\RecruitmentPost;
use App\Models\Student\Profile;
use App\Models\Student\Registration;
use App\Support\Student\ApplicationEligibility;
use Illuminate\Support\Carbon;

// Pure logic: models are built in memory, nothing touches the database.
uses(Tests\TestCase::class);

beforeEach(fn () => Carbon::setTestNow('2026-10-27'));
afterEach(fn () => Carbon::setTestNow());

function candidate(array $attrs = [], array $profile = []): Registration
{
    $student = new Registration(array_merge([
        'full_name' => 'Test Candidate', 'dob' => '2000-01-01', 'gender' => 'Female', 'category' => 'UR', 'pwbd' => 'no',
    ], $attrs));
    $student->dob = $attrs['dob'] ?? '2000-01-01';
    $student->setRelation('profile', new Profile(array_merge(['status' => 'completed', 'personal' => [], 'other_details' => []], $profile)));

    return $student;
}

function advert(array $attrs = [], array $eligibility = []): Recruitment
{
    return new Recruitment(array_merge([
        'status' => 'published', 'selection_mode' => 'exam', 'apply_mode' => 'online',
        'app_start' => '2026-10-01', 'app_end' => '2026-11-30',
        'eligibility' => array_merge(['age_min' => 18, 'age_max' => 35, 'age_cutoff' => '2026-11-30', 'gender' => 'any'], $eligibility),
    ], $attrs));
}

function failedKeys(array $result): array
{
    return collect($result['checks'])->where('status', 'fail')->pluck('key')->all();
}

test('an eligible candidate passes every check', function () {
    $result = ApplicationEligibility::evaluate(candidate(), advert(), new RecruitmentPost(['minimum_qualification' => 'GNM']));

    expect($result['eligible'])->toBeTrue();
    expect(collect($result['checks'])->pluck('key')->all())->toContain('window', 'profile', 'age', 'qualification');
});

test('an incomplete profile blocks the application', function () {
    $result = ApplicationEligibility::evaluate(candidate(profile: ['status' => 'draft']), advert(), new RecruitmentPost);

    expect($result['eligible'])->toBeFalse()->and(failedKeys($result))->toBe(['profile']);
});

test('closed, upcoming and walk-in advertisements cannot be applied to', function () {
    $post = new RecruitmentPost;

    expect(failedKeys(ApplicationEligibility::evaluate(candidate(), advert(['app_end' => '2026-10-01']), $post)))->toContain('window');
    expect(failedKeys(ApplicationEligibility::evaluate(candidate(), advert(['app_start' => '2026-12-01', 'app_end' => '2026-12-30']), $post)))->toContain('window');
    expect(failedKeys(ApplicationEligibility::evaluate(candidate(), advert(['selection_mode' => 'interview', 'apply_mode' => 'walk_in']), $post)))->toContain('window');
});

test('age is measured on the cut-off date and relaxed by category', function () {
    $post = new RecruitmentPost;
    $old = ['dob' => '1988-01-01']; // 38 on the cut-off

    expect(failedKeys(ApplicationEligibility::evaluate(candidate($old), advert(), $post)))->toContain('age');

    $sc = candidate($old + ['category' => 'SC']);
    $relaxed = advert(eligibility: ['relaxations' => ['SC' => 5]]);

    expect(ApplicationEligibility::evaluate($sc, $relaxed, $post)['eligible'])->toBeTrue();
});


test('gender restricted advertisements reject other candidates', function () {
    $result = ApplicationEligibility::evaluate(candidate(['gender' => 'Male']), advert(eligibility: ['gender' => 'female']), new RecruitmentPost);

    expect(failedKeys($result))->toBe(['gender']);
});

test('PRTC and experience requirements are enforced', function () {
    $post = new RecruitmentPost(['experience_years' => 2]);
    $advert = advert(eligibility: ['prtc_required' => true]);

    expect(failedKeys(ApplicationEligibility::evaluate(candidate(), $advert, $post)))->toBe(['prtc', 'experience']);

    $ready = candidate(profile: [
        'personal' => ['is_tripura_resident' => 'yes', 'prtc_number' => 'P-1'],
        'experience' => ['has_experience' => 'yes', 'entries' => [['from_date' => '2023-01-01', 'to_date' => '2026-01-01']]],
    ]);

    expect(ApplicationEligibility::evaluate($ready, $advert, $post)['eligible'])->toBeTrue();
});

test('the fee follows PwBD first and then category', function () {
    $advert = advert(['fees' => ['amounts' => ['UR' => 500, 'SC' => 250, 'PwBD' => 0]]]);

    expect(ApplicationEligibility::fee(candidate(), $advert))->toBe(500.0);
    expect(ApplicationEligibility::fee(candidate(['category' => 'SC']), $advert))->toBe(250.0);
    expect(ApplicationEligibility::fee(candidate(profile: ['personal' => ['is_pwd' => 'yes']]), $advert))->toBe(0.0);
});
