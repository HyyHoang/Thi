<?php

namespace Database\Seeders;

use App\Models\Semester;
use Illuminate\Database\Seeder;

class SemesterSeeder extends Seeder
{
    public function run(): void
    {
        $semesters = [
            [
                'SemesterID' => 'SE001',
                'SemesterName' => 'Học kỳ 1',
                'AcademicYear' => '2025-2026',
                'StartDate' => '2025-09-01',
                'EndDate' => '2026-01-10',
            ],
            [
                'SemesterID' => 'SE002',
                'SemesterName' => 'Học kỳ 2',
                'AcademicYear' => '2025-2026',
                'StartDate' => '2026-01-20',
                'EndDate' => '2026-05-30',
            ],
            [
                'SemesterID' => 'SE003',
                'SemesterName' => 'Học kỳ Hè',
                'AcademicYear' => '2025-2026',
                'StartDate' => '2026-06-15',
                'EndDate' => '2026-08-15',
            ],
        ];

        foreach ($semesters as $semester) {
            Semester::updateOrCreate(
                ['SemesterID' => $semester['SemesterID']],
                $semester
            );
        }
    }
}
