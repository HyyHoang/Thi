<?php

namespace App\Repositories\Contracts;

use App\Models\TeacherProfile;
use Illuminate\Support\Collection;

interface TeacherProfileRepositoryInterface extends RepositoryInterface
{
    /**
     * Lấy danh sách hồ sơ giảng viên kèm thông tin user và department
     */
    public function getAllWithRelations(): Collection;

    /**
     * Tìm hồ sơ theo UserID
     */
    public function findByUserId(int $userId): ?TeacherProfile;
    
    /**
     * Lấy chi tiết hồ sơ kèm relations
     */
    public function findByIdWithRelations(int $id): ?TeacherProfile;
}
