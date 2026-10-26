<?php

namespace App\Http\Requests\Admin;

use App\Models\Admin\Post;
use App\Support\Admin\RecruitmentOptions;
use Closure;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SavePostRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user('admin') !== null;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'code' => ['required', 'string', 'max:50', function (string $attribute, mixed $value, Closure $fail) {
                // Not Rule::unique(): the schema-qualified table name is parsed as a connection.
                $taken = Post::query()
                    ->where('code', $value)
                    ->when($this->route('post'), fn ($q, $post) => $q->whereKeyNot($post->getKey()))
                    ->exists();

                if ($taken) {
                    $fail('This post code is already in use.');
                }
            }],
            'is_contractual' => ['required', 'boolean'],
            'minimum_qualification' => ['required', 'string', Rule::in(RecruitmentOptions::QUALIFICATIONS)],
            'preferable_qualification' => ['nullable', 'string', 'max:500'],
            'experience_required' => ['required', 'boolean'],
            'experience_years' => [Rule::requiredIf(fn () => $this->boolean('experience_required')), 'nullable', 'numeric', 'min:0.5', 'max:50'],
            'experience_criteria' => ['nullable', 'string', 'max:500'],
            'is_active' => ['required', 'boolean'],
        ];
    }

    /** @return array<string, mixed> */
    public function payload(): array
    {
        $data = $this->validated();

        if (! $data['experience_required']) {
            $data['experience_criteria'] = $data['experience_years'] = null;
        }

        return $data;
    }
}
