<?php

namespace App\Services\Contracts;

interface UserServiceInterface extends ServiceInterface
{
    /**
     * Lấy danh sách tất cả user đã được format.
     *
     * @return array<int, array<string, mixed>>
     */
    public function getAllFormatted(): array;

    /**
     * Lấy chi tiết 1 user đã được format.
     *
     * @return array<string, mixed>
     */
    public function getByIdFormatted(int $id): array;
}
