<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SubjectUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'SubjectName' => 'sometimes|string|max:255',
            'DepartmentID' => 'sometimes|exists:Department,DepartmentID',
            'Credit' => 'sometimes|integer|min:1|max:12',
            'Description' => 'nullable|string',
        ];
    }

    public function messages(): array
    {
        return [
            'Credit.min' => 'Số tín chỉ tối thiểu là 1.',
            'Credit.max' => 'Số tín chỉ tối đa là 12.',
        ];
    }
}
