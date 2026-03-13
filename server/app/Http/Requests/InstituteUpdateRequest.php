<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class InstituteUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $instituteId = (int) $this->route('id');

        return [
            'institute_name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('Institute', 'InstituteName')->ignore($instituteId, 'InstituteID'),
            ],
            'description' => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'institute_name.required' => 'Vui lòng nhập tên viện.',
            'institute_name.unique' => 'Tên viện đã tồn tại.',
        ];
    }
}

