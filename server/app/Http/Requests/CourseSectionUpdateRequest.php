<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CourseSectionUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'SectionName' => 'required|string|max:255',
            'SubjectID'   => 'required|exists:Subject,SubjectID',
            'SemesterID'  => 'required|exists:Semester,SemesterID',
            'TeacherID'   => 'required|exists:TeacherProfile,TeacherID',
            'MaxStudent'  => 'required|integer|min:1',
        ];
    }

    public function messages(): array
    {
        return [
            'SectionName.required' => 'Tên lớp học phần không được để trống.',
            'SubjectID.required'   => 'Môn học không được để trống.',
            'SubjectID.exists'     => 'Môn học không tồn tại.',
            'SemesterID.required'  => 'Học kỳ không được để trống.',
            'SemesterID.exists'    => 'Học kỳ không tồn tại.',
            'TeacherID.required'   => 'Giảng viên không được để trống.',
            'TeacherID.exists'     => 'Giảng viên không tồn tại.',
            'MaxStudent.required'  => 'Sĩ số tối đa không được để trống.',
            'MaxStudent.min'       => 'Sĩ số tối đa phải lớn hơn 0.',
        ];
    }
}
