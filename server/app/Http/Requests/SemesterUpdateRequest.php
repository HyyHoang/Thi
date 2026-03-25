<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class SemesterUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $semesterId = (string) $this->route('id');

        return [
            'semester_name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('Semester', 'SemesterName')
                    ->where(fn ($query) => $query->where('AcademicYear', $this->input('academic_year')))
                    ->ignore($semesterId, 'SemesterID'),
            ],
            'academic_year' => ['required', 'string', 'max:20'],
            'start_date' => [
                'required',
                'date',
                'before:end_date',
                function (string $attribute, mixed $value, \Closure $fail) use ($semesterId) {
                    if (!$this->isOverlapped((string) $value, (string) $this->input('end_date'), $semesterId)) {
                        return;
                    }

                    $fail('Khoảng thời gian của học kỳ bị chồng với học kỳ khác.');
                },
            ],
            'end_date' => ['required', 'date', 'after:start_date'],
        ];
    }

    public function messages(): array
    {
        return [
            'semester_name.required' => 'Vui lòng nhập tên học kỳ.',
            'semester_name.unique' => 'Học kỳ đã tồn tại trong năm học này.',
            'academic_year.required' => 'Vui lòng nhập năm học.',
            'start_date.required' => 'Vui lòng chọn ngày bắt đầu.',
            'start_date.before' => 'Ngày bắt đầu phải nhỏ hơn ngày kết thúc.',
            'end_date.required' => 'Vui lòng chọn ngày kết thúc.',
            'end_date.after' => 'Ngày kết thúc phải lớn hơn ngày bắt đầu.',
        ];
    }

    private function isOverlapped(string $startDate, string $endDate, string $excludeId): bool
    {
        if (!$startDate || !$endDate) {
            return false;
        }

        return DB::table('Semester')
            ->where('SemesterID', '!=', $excludeId)
            ->where('StartDate', '<=', $endDate)
            ->where('EndDate', '>=', $startDate)
            ->exists();
    }
}
