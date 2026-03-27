<?php

namespace App\Services\Contracts;

interface CourseSectionServiceInterface extends ServiceInterface
{
    /**
     * Lấy danh sách lớp học phần kèm thông tin môn, học kỳ, giảng viên.
     *
     * @return array
     */
    public function getAllWithRelations(): array;

    /**
     * Lấy chi tiết lớp học phần kèm thông tin môn, học kỳ, giảng viên.
     *
     * @param string|int $id
     * @return array
     */
    public function getByIdWithRelations(string|int $id): array;
}
