<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class QuestionChapterStoreRequest extends FormRequest
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
        $bankId = $this->route('bankId');

        return [
            'chapter_number' => [
                'required',
                'integer',
                'min:1',
                Rule::unique('question_chapters', 'ChapterNumber')->where(
                    fn ($q) => $q->where('BankID', $bankId)
                ),
            ],
            'chapter_name'   => 'required|string|max:255',
            'description'    => 'nullable|string',
        ];
    }
}
