<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class QuestionBankStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'bank_name'   => 'required|string|max:255',
            'subject_id'  => 'required|string|exists:Subject,SubjectID',
            'description' => 'nullable|string',
            'chapters'    => 'required|array|min:1|max:100',
            'chapters.*.chapter_number' => 'required|integer|min:1|distinct',
            'chapters.*.chapter_name'   => 'required|string|max:255',
            'chapters.*.description'    => 'nullable|string',
        ];
    }
}
