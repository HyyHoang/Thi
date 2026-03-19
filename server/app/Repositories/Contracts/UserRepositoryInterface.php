<?php

namespace App\Repositories\Contracts;

use Illuminate\Support\Collection;

interface UserRepositoryInterface extends RepositoryInterface
{
    /**
     * Lấy toàn bộ user, sắp xếp giảm dần theo UserID.
     */
    public function getAllOrdered(): Collection;

    /**
     * Kiểm tra xem username đã tồn tại chưa (bỏ qua ID hiện tại khi update).
     */
    public function existsByUsername(string $username, ?int $excludeId = null): bool;

    /**
     * Kiểm tra xem email đã tồn tại chưa (bỏ qua ID hiện tại khi update).
     */
    public function existsByEmail(string $email, ?int $excludeId = null): bool;
}
