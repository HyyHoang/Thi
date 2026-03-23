<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SubjectStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'SubjectName' => 'required|string|max:255',
            'DepartmentID' => 'required|exists:Department,DepartmentID',
            'Credit' => 'required|integer|min:1|max:12',
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
