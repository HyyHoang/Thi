<?php

namespace App\Services\Contracts;

interface ServiceInterface
{
    /**
     * Lấy toàn bộ resource.
     */
    public function getAll(): mixed;

    /**
     * Lấy chi tiết 1 resource theo ID.
     */
    public function getById(int $id): mixed;

    /**
     * Tạo mới resource.
     *
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): mixed;

    /**
     * Cập nhật resource.
     *
     * @param  array<string, mixed>  $data
     */
    public function update(int $id, array $data): mixed;

    /**
     * Xóa resource theo ID.
     */
    public function delete(int $id): bool;
}
