<?php

namespace App\Services\Contracts;

interface InstituteServiceInterface extends ServiceInterface
{
    /**
     * Lấy danh sách tất cả viện đã được format.
     *
     * @return array<int, array<string, mixed>>
     */
    public function getAllFormatted(): array;

    /**
     * Lấy chi tiết 1 viện đã được format.
     *
     * @return array<string, mixed>
     */
    public function getByIdFormatted(int $id): array;
}
