<?php

namespace App\Services\Contracts;

interface DepartmentServiceInterface extends ServiceInterface
{
    /**
     * Lấy danh sách tất cả khoa kèm thông tin viện (Institute).
     *
     * @return array<int, array<string, mixed>>
     */
    public function getAllWithInstitute(): array;

    /**
     * Lấy chi tiết 1 khoa kèm thông tin viện.
     *
     * @return array<string, mixed>
     */
    public function getByIdWithInstitute(int $id): array;
}
