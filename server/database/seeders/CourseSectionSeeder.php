<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\CourseSection;
use App\Models\Subject;
use App\Models\Semester;
use App\Models\TeacherProfile;
use Illuminate\Support\Str;

class CourseSectionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $subjects = Subject::all();
        $semesters = Semester::all();
        $teachers = TeacherProfile::all();

        if ($subjects->isEmpty() || $semesters->isEmpty() || $teachers->isEmpty()) {
            return;
        }

        $sections = [
            'Công nghệ phần mềm lớp 1',
            'Hệ quản trị CSDL lớp 1',
            'Trí tuệ nhân tạo lớp 1',
            'Mạng máy tính lớp 1',
            'Lập trình Web lớp 1',
        ];

        foreach ($sections as $index => $sectionName) {
            // Attempt to generate a deterministic ID since we don't have a DB trigger for CS yet.
            $sectionId = 'CS' . str_pad($index + 1, 3, '0', STR_PAD_LEFT);
            
            // To ensure uniqueness just in case
            if(!CourseSection::where('SectionID', $sectionId)->exists()){
                CourseSection::create([
                    'SectionID' => $sectionId,
                    'SubjectID' => $subjects->random()->SubjectID,
                    'SemesterID' => $semesters->random()->SemesterID,
                    'TeacherID' => $teachers->random()->TeacherID,
                    'SectionName' => $sectionName,
                    'MaxStudent' => rand(30, 80),
                    'CreatedDate' => now(),
                ]);
            }
        }
    }
}
