<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TeacherProfileStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'user_id' => 'required|integer|exists:users,id',
            'department_id' => 'required|integer',
            'full_name' => 'required|string|max:255',
            'gender' => 'nullable|string|max:10',
            'birth_date' => 'nullable|date',
            'phone' => 'nullable|string|max:15',
            'degree' => 'nullable|string|max:100',
            'academic_rank' => 'nullable|string|max:100',
        ];
    }
}
