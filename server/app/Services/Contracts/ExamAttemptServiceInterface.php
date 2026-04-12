<?php

namespace App\Services\Contracts;

use App\Models\User;

interface ExamAttemptServiceInterface extends ServiceInterface
{
    /** Lấy tất cả lượt làm theo đề (Admin/Teacher xem) */
    public function getAllByExam(string $examId): array;

    /** Lấy tất cả lượt làm theo sinh viên */
    public function getAllByStudent(string $studentId): array;

    /** Lấy toàn bộ lượt làm (Admin) */
    public function getAll(): array;

    /** Chi tiết một lượt làm */
    public function getDetail(int $id): array;

    /** Tạo lượt làm mới */
    public function create(array $data): array;

    /** Cập nhật trạng thái / submit */
    public function updateAttempt(int $id, array $data, User $user): array;

    /** Xóa lượt làm (Admin only) */
    public function deleteAttempt(int $id, User $user): bool;
}
