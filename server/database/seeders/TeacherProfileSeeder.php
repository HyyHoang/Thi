<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TeacherProfileSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('TeacherProfile')->insert([
            ['UserID' => 1, 'DepartmentID' => 1, 'FullName' => 'Nguyễn Văn An', 'Gender' => 'Nam', 'BirthDate' => '1980-05-12', 'Phone' => '0912345678', 'Degree' => 'Thạc sĩ', 'AcademicRank' => 'Giảng viên'],
            ['UserID' => 2, 'DepartmentID' => 1, 'FullName' => 'Trần Thị Bích Ngọc', 'Gender' => 'Nữ', 'BirthDate' => '1985-08-21', 'Phone' => '0912345679', 'Degree' => 'Tiến sĩ', 'AcademicRank' => 'Giảng viên chính'],
            ['UserID' => 3, 'DepartmentID' => 2, 'FullName' => 'Lê Văn Cường', 'Gender' => 'Nam', 'BirthDate' => '1978-03-15', 'Phone' => '0912345680', 'Degree' => 'Thạc sĩ', 'AcademicRank' => 'Giảng viên'],
            ['UserID' => 4, 'DepartmentID' => 2, 'FullName' => 'Phạm Thị Diễm', 'Gender' => 'Nữ', 'BirthDate' => '1990-11-30', 'Phone' => '0912345681', 'Degree' => 'Thạc sĩ', 'AcademicRank' => 'Giảng viên'],
            ['UserID' => 5, 'DepartmentID' => 3, 'FullName' => 'Hoàng Văn Dũng', 'Gender' => 'Nam', 'BirthDate' => '1982-07-19', 'Phone' => '0912345682', 'Degree' => 'Tiến sĩ', 'AcademicRank' => 'Phó giáo sư'],
            ['UserID' => 6, 'DepartmentID' => 3, 'FullName' => 'Đỗ Thị Hạnh', 'Gender' => 'Nữ', 'BirthDate' => '1987-01-25', 'Phone' => '0912345683', 'Degree' => 'Thạc sĩ', 'AcademicRank' => 'Giảng viên'],
            ['UserID' => 7, 'DepartmentID' => 4, 'FullName' => 'Vũ Văn Hải', 'Gender' => 'Nam', 'BirthDate' => '1975-09-10', 'Phone' => '0912345684', 'Degree' => 'Tiến sĩ', 'AcademicRank' => 'Giáo sư'],
            ['UserID' => 8, 'DepartmentID' => 4, 'FullName' => 'Bùi Thị Lan Anh', 'Gender' => 'Nữ', 'BirthDate' => '1992-04-05', 'Phone' => '0912345685', 'Degree' => 'Thạc sĩ', 'AcademicRank' => 'Giảng viên'],
            ['UserID' => 9, 'DepartmentID' => 5, 'FullName' => 'Ngô Văn Minh', 'Gender' => 'Nam', 'BirthDate' => '1983-12-22', 'Phone' => '0912345686', 'Degree' => 'Thạc sĩ', 'AcademicRank' => 'Giảng viên chính'],
            ['UserID' => 10, 'DepartmentID' => 5, 'FullName' => 'Dương Thị Thu Trang', 'Gender' => 'Nữ', 'BirthDate' => '1991-06-17', 'Phone' => '0912345687', 'Degree' => 'Thạc sĩ', 'AcademicRank' => 'Giảng viên'],
        ]);
    }
}
