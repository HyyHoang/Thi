<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ExamAttemptUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status'      => 'sometimes|string|in:in_progress,submitted,expired',
            'submit_time' => 'sometimes|nullable|date',
            'ip_address'  => 'sometimes|nullable|string|max:45',
        ];
    }

    public function messages(): array
    {
        return [
            'status.in' => 'Trạng thái không hợp lệ. Chọn: in_progress, submitted, expired.',
        ];
    }
}
