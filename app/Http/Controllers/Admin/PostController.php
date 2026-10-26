<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SavePostRequest;
use App\Models\Admin\Post;
use App\Support\Admin\RecruitmentOptions;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PostController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search'));
        $status = (string) $request->query('status');

        $posts = Post::query()
            ->when($search !== '', fn ($q) => $q->where(fn ($w) => $w
                ->where('name', 'ilike', "%{$search}%")
                ->orWhere('code', 'ilike', "%{$search}%")))
            ->when(in_array($status, ['active', 'inactive'], true), fn ($q) => $q->where('is_active', $status === 'active'))
            ->orderBy('name')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('admin/masters/posts', [
            'posts' => $posts->through(fn (Post $p) => $p->only([
                'id', 'name', 'code', 'is_contractual', 'minimum_qualification', 'preferable_qualification',
                'experience_required', 'experience_years', 'experience_criteria', 'is_active',
            ])),
            'filters' => ['search' => $search, 'status' => $status],
            'qualifications' => RecruitmentOptions::QUALIFICATIONS,
        ]);
    }

    public function store(SavePostRequest $request): RedirectResponse
    {
        $adminId = $request->user('admin')->id;

        Post::create($request->payload() + ['created_by' => $adminId, 'updated_by' => $adminId]);

        return $this->done('Post created.');
    }

    public function update(SavePostRequest $request, Post $post): RedirectResponse
    {
        $post->update($request->payload() + ['updated_by' => $request->user('admin')->id]);

        return $this->done('Post updated.');
    }

    public function toggle(Request $request, Post $post): RedirectResponse
    {
        $post->update(['is_active' => ! $post->is_active, 'updated_by' => $request->user('admin')->id]);

        return $this->done($post->is_active ? 'Post enabled.' : 'Post disabled.');
    }

    public function destroy(Post $post): RedirectResponse
    {
        $post->delete();

        return $this->done('Post deleted.');
    }

    private function done(string $message): RedirectResponse
    {
        Inertia::flash('toast', ['type' => 'success', 'message' => $message]);

        return back();
    }
}
