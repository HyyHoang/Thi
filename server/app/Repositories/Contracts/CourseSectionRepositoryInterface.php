<?php

namespace App\Repositories\Contracts;

use Illuminate\Support\Collection;

interface CourseSectionRepositoryInterface extends RepositoryInterface
{
    /**
     * Lấy danh sách tất cả lớp học phần sắp xếp theo SectionID.
     *
     * @return Collection
     */
    public function getAll(): Collection;

    /**
     * Kiểm tra tên lớp học phần đã tồn tại chưa (có loại trừ ID).
     *
     * @param string $name
     * @param string|int|null $excludeId
     * @return bool
     */
    public function existsByName(string $name, string|int|null $excludeId = null): bool;
}
