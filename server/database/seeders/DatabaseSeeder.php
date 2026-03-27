<?php

namespace Database\Seeders;

use App\Models\User;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{


    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::updateOrCreate([
            'Username' => 'admin',
        ], [
            // Chuẩn hóa mật khẩu mặc định cho tài khoản quản trị.
            'Password' => '123456',
            'Email' => 'admin@example.com',
            'Role' => 0, // admin role
        ]);

        $this->call([
            InstituteSeeder::class,
            DepartmentSeeder::class,
            SemesterSeeder::class,
            TeacherProfileSeeder::class,
            SubjectSeeder::class,
            StudentProfileSeeder::class,
            CourseSectionSeeder::class,
        ]);
    }
}
