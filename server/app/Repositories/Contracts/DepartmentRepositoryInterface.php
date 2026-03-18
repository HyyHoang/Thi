<?php

namespace App\Repositories\Contracts;

use Illuminate\Support\Collection;

interface DepartmentRepositoryInterface extends RepositoryInterface
{
    /**
     * Lấy toàn bộ khoa, sắp xếp theo DepartmentID.
     */
    public function getAllOrdered(): Collection;

    /**
     * Kiểm tra xem tên khoa đã tồn tại chưa (bỏ qua ID hiện tại khi update).
     */
    public function existsByName(string $name, ?int $excludeId = null): bool;
}
