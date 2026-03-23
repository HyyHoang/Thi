<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class QuestionBankUpdateRequest extends FormRequest
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
        ];
    }
}
