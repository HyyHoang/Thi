<?php

namespace App\Repositories\Contracts;

use Illuminate\Support\Collection;

interface InstituteRepositoryInterface extends RepositoryInterface
{
    /**
     * Lấy toàn bộ viện, sắp xếp theo InstituteID.
     */
    public function getAllOrdered(): Collection;

    /**
     * Kiểm tra xem tên viện đã tồn tại chưa (bỏ qua ID hiện tại khi update).
     */
    public function existsByName(string $name, ?int $excludeId = null): bool;
}
