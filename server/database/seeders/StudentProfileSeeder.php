<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class StudentProfileSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $profiles = [
            [
                'StudentID' => 'SP001',
                // Assuming UserID and DepartmentID will be linked or nullable for now. 
                // We leave them null or add a fake one if they exist. We'll set null to avoid FK errors if missing.
                'UserID' => null,
                'DepartmentID' => null,
                'FullName' => 'Nguyễn Văn Sinh Viên 1',
                'EnrollmentYear' => 2023,
                'Status' => 1,
            ],
            [
                'StudentID' => 'SP002',
                'UserID' => null,
                'DepartmentID' => null,
                'FullName' => 'Trần Thị Học Sinh 2',
                'EnrollmentYear' => 2022,
                'Status' => 2,
            ],
            [
                'StudentID' => 'SP003',
                'UserID' => null,
                'DepartmentID' => null,
                'FullName' => 'Lê Văn Bỏ Học',
                'EnrollmentYear' => 2021,
                'Status' => 3,
            ]
        ];

        foreach ($profiles as $profile) {
            \App\Models\StudentProfile::create($profile);
        }
    }
}
