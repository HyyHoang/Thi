<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class InstituteStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'institute_name' => ['required', 'string', 'max:255', 'unique:Institute,InstituteName'],
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

