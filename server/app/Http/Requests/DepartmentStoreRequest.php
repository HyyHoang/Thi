<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class DepartmentStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'department_name' => ['required', 'string', 'max:255', 'unique:Department,DepartmentName'],
            'institute_id' => ['required', 'integer', 'exists:Institute,InstituteID'],
            'description' => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'department_name.required' => 'Vui lòng nhập tên khoa.',
            'department_name.unique' => 'Tên khoa đã tồn tại.',
            'institute_id.required' => 'Vui lòng chọn viện.',
            'institute_id.exists' => 'Viện không hợp lệ.',
        ];
    }
}

