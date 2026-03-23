<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class QuestionStoreRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'SubjectID' => 'nullable|string|max:20',
            'BankID' => 'nullable|string|max:10|exists:question_banks,BankID',
            'ChapterNumber' => 'nullable|integer|min:1',
            'Content' => 'required|string|max:255',
            'CorrectAnswer' => 'nullable|string|max:100',
            'Type' => 'required|in:single,multiple,essay',
            'options' => 'required_if:Type,single,multiple|array',
            'options.*.Content' => 'required_with:options|string',
            'options.*.IsCorrect' => 'nullable|boolean',
            'options.*.OrderNumber' => 'nullable|integer',
        ];
    }
}
