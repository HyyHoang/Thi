<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

use App\Models\Enrollment;
use App\Models\CourseSection;
use App\Models\StudentProfile;

class EnrollmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $sections = CourseSection::take(5)->pluck('SectionID')->toArray();
        $students = StudentProfile::take(10)->pluck('StudentID')->toArray();

        if (empty($sections) || empty($students)) {
            return;
        }

        foreach ($sections as $sectionID) {
            // Đăng ký ngẫu nhiên 1-3 sinh viên cho mỗi lớp
            $numEnrollments = rand(1, 3);
            $randomStudents = (array) array_rand(array_flip($students), $numEnrollments);

            foreach ($randomStudents as $studentID) {
                Enrollment::create([
                    'SectionID' => $sectionID,
                    'StudentID' => $studentID,
                    'EnrollDate' => now(),
                    'Status' => 1,
                ]);
            }
        }
    }
}
