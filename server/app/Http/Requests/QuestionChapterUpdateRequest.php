<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class QuestionChapterUpdateRequest extends FormRequest
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
        $chapterId = (int) $this->route('chapterId');

        return [
            'chapter_number' => [
                'sometimes',
                'integer',
                'min:1',
                Rule::unique('question_chapters', 'ChapterNumber')
                    ->where(fn ($q) => $q->where('BankID', $bankId))
                    ->ignore($chapterId, 'ChapterID'),
            ],
            'chapter_name'   => 'sometimes|string|max:255',
            'description'    => 'nullable|string',
        ];
    }
}
