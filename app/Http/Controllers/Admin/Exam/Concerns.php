<?php

namespace App\Http\Controllers\Admin\Exam;

use App\Models\Admin\Recruitment;
use App\Models\Admin\RecruitmentExam;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

/** Shared by the exam-flow controllers, all of which work on one recruitment picked with ?recruitment=. */
trait Concerns
{
    /** @return list<array{id: int, advt_no: string, title: string}> */
    protected function recruitments(): array
    {
        return Recruitment::query()->orderByDesc('id')->get(['id', 'advt_no', 'title'])
            ->map(fn ($r) => ['id' => $r->id, 'advt_no' => $r->advt_no, 'title' => $r->title])->all();
    }

    protected function selected(Request $request): ?Recruitment
    {
        $id = (int) $request->query('recruitment');

        return $id > 0 ? Recruitment::find($id) : null;
    }

    protected function exam(Recruitment $recruitment): RecruitmentExam
    {
        return RecruitmentExam::forRecruitment($recruitment->id);
    }

    protected function toast(string $type, string $message): RedirectResponse
    {
        Inertia::flash('toast', ['type' => $type, 'message' => $message]);

        return back();
    }
}
