<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ExamAttemptStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'exam_id'    => 'required|string|exists:Exam,ExamID',
            'student_id' => 'required|string|exists:StudentProfile,StudentID',
            'ip_address' => 'nullable|string|max:45',
        ];
    }

    public function messages(): array
    {
        return [
            'exam_id.required'    => 'Vui lòng cung cấp mã đề thi.',
            'exam_id.exists'      => 'Đề thi không tồn tại.',
            'student_id.required' => 'Vui lòng cung cấp mã sinh viên.',
            'student_id.exists'   => 'Sinh viên không tồn tại.',
        ];
    }
}
