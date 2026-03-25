<?php

namespace App\Services\Contracts;

interface SemesterServiceInterface extends ServiceInterface
{
    /**
     * Lấy danh sách học kỳ đã chuẩn hóa response.
     *
     * @return array<int, array<string, mixed>>
     */
    public function getAllFormatted(): array;

    /**
     * Lấy chi tiết học kỳ theo định dạng response.
     *
     * @return array<string, mixed>
     */
    public function getByIdFormatted(string|int $id): array;
}
