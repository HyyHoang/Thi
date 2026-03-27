<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StudentProfileStoreRequest extends FormRequest
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
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'UserID' => 'nullable|string',
            'DepartmentID' => 'nullable|string',
            'FullName' => 'required|string|max:255',
            'EnrollmentYear' => 'required|integer|max:' . date('Y'),
            'Status' => 'required|integer|in:1,2,3',
        ];
    }
}
