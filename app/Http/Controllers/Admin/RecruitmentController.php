<?php

namespace App\Http\Controllers\Admin;

use App\Actions\Admin\SaveRecruitment;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SaveRecruitmentRequest;
use App\Models\Admin\Recruitment;
use App\Models\Admin\RecruitmentEvent;
use App\Support\Admin\RecruitmentOptions;
use App\Support\Admin\RecruitmentPresenter;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class RecruitmentController extends Controller
{
    private const PER_PAGE = 15;

    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search'));
        $status = (string) $request->query('status');
        $year = (string) $request->query('year');

        $all = Recruitment::query()
            ->with('posts')
            ->when($search !== '', fn ($q) => $q->where(fn ($w) => $w
                ->where('advt_no', 'ilike', "%{$search}%")
                ->orWhere('title', 'ilike', "%{$search}%")))
            ->latest('id')
            ->get()
            ->map(fn (Recruitment $r) => RecruitmentPresenter::row($r));

        $years = $all->pluck('year')->unique()->sortDesc()->values();

        $filtered = $all
            ->when($status !== '', fn ($c) => $c->where('status', $status))
            ->when($year !== '', fn ($c) => $c->where('year', $year))
            ->values();

        $page = max(1, (int) $request->query('page', 1));

        return Inertia::render('admin/recruitments/index', [
            'recruitments' => $filtered->forPage($page, self::PER_PAGE)->values(),
            'meta' => [
                'page' => $page,
                'last_page' => max(1, (int) ceil($filtered->count() / self::PER_PAGE)),
                'total' => $filtered->count(),
            ],
            'filters' => ['search' => $search, 'status' => $status, 'year' => $year],
            'years' => $years,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/recruitments/form', [
            'recruitment' => null,
            'options' => RecruitmentOptions::forClient(),
        ]);
    }

    public function store(SaveRecruitmentRequest $request, SaveRecruitment $save): RedirectResponse
    {
        $recruitment = $save->handle(
            null,
            $request->validated(),
            $request->user('admin')->id,
            $request->file('advertisement_pdf'),
            $request->file('syllabus_pdf'),
        );

        return $this->saved($recruitment, $request->input('action'));
    }

    public function show(Recruitment $recruitment): Response
    {
        return Inertia::render('admin/recruitments/show', [
            'recruitment' => RecruitmentPresenter::form($recruitment),
            'events' => $recruitment->events()->with('admin')->get()->map(fn ($e) => RecruitmentPresenter::event($e)),
            'options' => RecruitmentOptions::forClient(),
        ]);
    }

    public function edit(Recruitment $recruitment): Response|RedirectResponse
    {
        if ($recruitment->status === Recruitment::CANCELLED) {
            return redirect()->route('admin.recruitments.show', $recruitment);
        }

        return Inertia::render('admin/recruitments/form', [
            'recruitment' => RecruitmentPresenter::form($recruitment),
            'options' => RecruitmentOptions::forClient(),
        ]);
    }

    public function update(SaveRecruitmentRequest $request, Recruitment $recruitment, SaveRecruitment $save): RedirectResponse
    {
        abort_if($recruitment->status === Recruitment::CANCELLED, 403, 'A cancelled recruitment cannot be edited.');

        $recruitment = $save->handle(
            $recruitment,
            $request->validated(),
            $request->user('admin')->id,
            $request->file('advertisement_pdf'),
            $request->file('syllabus_pdf'),
        );

        return $this->saved($recruitment, $request->input('action'));
    }

    public function duplicate(Request $request, Recruitment $recruitment): RedirectResponse
    {
        $recruitment->load('posts');

        $copyNo = $recruitment->advt_no.'-COPY';

        for ($n = 2; Recruitment::where('advt_no', $copyNo)->exists(); $n++) {
            $copyNo = $recruitment->advt_no.'-COPY'.$n;
        }

        $copy = $recruitment->replicate(['status', 'publish_at', 'published_at', 'closed_at', 'status_reason', 'advertisement_pdf', 'syllabus_pdf', 'app_start', 'app_end', 'fee_last_date', 'correction_end', 'admit_card_date', 'exam_date', 'result_date', 'interview']);
        $copy->fill(['advt_no' => $copyNo, 'status' => Recruitment::DRAFT, 'created_by' => $request->user('admin')->id]);
        $copy->save();

        foreach ($recruitment->posts as $post) {
            $copy->posts()->create($post->only(['name', 'code', 'monthly_salary', 'is_contractual', 'contract_duration', 'contract_unit', 'minimum_qualification', 'preferable_qualification', 'age_max', 'experience_years', 'reserved_for', 'total_vacancies', 'category_breakup', 'horizontal', 'district_breakup', 'sort']));
        }

        $this->log($copy, 'created', $request, null, ['duplicated_from' => $recruitment->advt_no]);

        return $this->done(redirect()->route('admin.recruitments.edit', $copy), 'Recruitment duplicated as a draft. Set the new dates and PDF, then publish.');
    }

    public function extend(Request $request, Recruitment $recruitment): RedirectResponse
    {
        abort_unless(in_array($recruitment->status, [Recruitment::PUBLISHED, Recruitment::CLOSED], true), 422, 'Only published recruitments can be extended.');

        $data = $request->validate([
            'new_end' => ['required', 'date', 'after_or_equal:today', 'after:'.($recruitment->app_end?->format('Y-m-d') ?? 'today')],
            'reason' => ['required', 'string', 'max:1000'],
        ], ['new_end.after' => 'The new date must be later than the current last date.']);

        $old = $recruitment->app_end?->format('Y-m-d');

        $recruitment->update(['app_end' => $data['new_end'], 'status' => Recruitment::PUBLISHED, 'closed_at' => null, 'updated_by' => $request->user('admin')->id]);
        $this->log($recruitment, 'extended', $request, $data['reason'], ['from' => $old, 'to' => $data['new_end']]);

        return $this->done(back(), 'Last date extended. A corrigendum notice has been published.');
    }

    public function close(Request $request, Recruitment $recruitment): RedirectResponse
    {
        abort_unless($recruitment->status === Recruitment::PUBLISHED, 422, 'Only an open recruitment can be closed.');

        $data = $request->validate(['reason' => ['required', 'string', 'max:1000']]);

        $recruitment->update(['status' => Recruitment::CLOSED, 'closed_at' => now(), 'status_reason' => $data['reason'], 'updated_by' => $request->user('admin')->id]);
        $this->log($recruitment, 'closed', $request, $data['reason']);

        return $this->done(back(), 'Recruitment closed. Applications are no longer accepted.');
    }

    public function cancel(Request $request, Recruitment $recruitment): RedirectResponse
    {
        abort_if(in_array($recruitment->status, [Recruitment::DRAFT, Recruitment::CANCELLED], true), 422, 'Drafts are deleted, not cancelled.');

        $data = $request->validate(['reason' => ['required', 'string', 'max:1000']]);

        $recruitment->update(['status' => Recruitment::CANCELLED, 'status_reason' => $data['reason'], 'updated_by' => $request->user('admin')->id]);
        $this->log($recruitment, 'cancelled', $request, $data['reason']);

        return $this->done(back(), 'Recruitment cancelled. A notice has been published.');
    }

    public function destroy(Recruitment $recruitment): RedirectResponse
    {
        abort_unless($recruitment->status === Recruitment::DRAFT, 422, 'Only drafts can be deleted. Cancel a published recruitment instead.');

        foreach ([$recruitment->advertisement_pdf, $recruitment->syllabus_pdf] as $file) {
            if ($file) {
                Storage::disk('public')->delete($file);
            }
        }

        $recruitment->delete();

        return $this->done(redirect()->route('admin.recruitments.index'), 'Draft deleted.');
    }

    private function saved(Recruitment $recruitment, ?string $action): RedirectResponse
    {
        $message = match ($action) {
            'publish' => 'Recruitment published. Candidates can now see it.',
            'schedule' => 'Recruitment scheduled for publishing.',
            default => $recruitment->wasRecentlyCreated ? 'Draft saved.' : 'Changes saved.',
        };

        return $this->done(
            in_array($action, ['publish', 'schedule'], true) || $recruitment->isLocked()
                ? redirect()->route('admin.recruitments.show', $recruitment)
                : redirect()->route('admin.recruitments.edit', $recruitment),
            $message,
        );
    }

    private function done(RedirectResponse $response, string $message): RedirectResponse
    {
        Inertia::flash('toast', ['type' => 'success', 'message' => $message]);

        return $response;
    }

    private function log(Recruitment $recruitment, string $type, Request $request, ?string $reason = null, ?array $meta = null): void
    {
        RecruitmentEvent::create([
            'recruitment_id' => $recruitment->id,
            'admin_id' => $request->user('admin')->id,
            'type' => $type,
            'reason' => $reason,
            'meta' => $meta,
        ]);
    }
}
