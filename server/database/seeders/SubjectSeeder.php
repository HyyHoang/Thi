<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Subject;
use App\Models\Department;

class SubjectSeeder extends Seeder
{
    public function run(): void
    {
        $departments = Department::all();
        
        if ($departments->isEmpty()) {
            return;
        }

        $subjects = [
            'Công nghệ phần mềm',
            'Hệ quản trị cơ sở dữ liệu',
            'Trí tuệ nhân tạo',
            'Mạng máy tính',
            'Lập trình Web',
            'Cấu trúc dữ liệu và giải thuật',
            'Hệ điều hành',
            'Kiến trúc máy tính',
            'Toán rời rạc',
            'Phân tích thiết kế hệ thống',
        ];

        foreach ($subjects as $index => $subjectName) {
            Subject::create([
                'DepartmentID' => $departments->random()->DepartmentID,
                'SubjectName' => $subjectName,
                'Description' => 'Mô tả cơ bản cho môn học ' . $subjectName,
                'Credit' => rand(2, 4),
            ]);
        }
    }
}
