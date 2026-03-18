<?php

namespace App\Repositories\Contracts;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;

interface RepositoryInterface
{
    /**
     * Lấy toàn bộ bản ghi.
     */
    public function getAll(): Collection;

    /**
     * Tìm bản ghi theo primary key.
     * Ném ModelNotFoundException nếu không tìm thấy.
     */
    public function findById(int $id): Model;

    /**
     * Tạo bản ghi mới và trả về model vừa tạo.
     *
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): Model;

    /**
     * Cập nhật bản ghi theo primary key và trả về model đã cập nhật.
     *
     * @param  array<string, mixed>  $data
     */
    public function update(int $id, array $data): Model;

    /**
     * Xóa bản ghi theo primary key. Trả về true nếu xóa thành công.
     */
    public function delete(int $id): bool;
}
