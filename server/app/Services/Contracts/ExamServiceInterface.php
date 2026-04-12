<?php

namespace App\Services\Contracts;

use App\Models\User;

interface ExamServiceInterface extends ServiceInterface
{
    /**
     * Lấy học kỳ hiện tại (ngày hôm nay nằm trong StartDate..EndDate).
     */
    public function getCurrentSemester(): ?array;

    /**
     * Lấy danh sách môn học có lớp học phần trong học kỳ này.
     */
    public function getSubjectsForSemester(string $semesterId): array;

    /**
     * Lấy danh sách ngân hàng câu hỏi theo môn học (kèm chapters).
     */
    public function getBanksForSubject(string $subjectId): array;

    /**
     * Lấy tất cả đề thi (Admin thấy tất cả, Teacher thấy tất cả nhưng chỉ sửa của mình).
     */
    public function getAllForUser(User $user): array;

    /**
     * Lấy chi tiết đề thi (kèm chapter configs).
     */
    public function getDetail(string $id): array;

    /**
     * Tạo đề thi cho user (validate đủ câu hỏi trong mỗi chương, lưu configs).
     */
    public function createForUser(array $data, User $user): array;

    /**
     * Cập nhật đề thi (chỉ Admin hoặc người tạo).
     */
    public function updateForUser(string $id, array $data, User $user): array;

    /**
     * Xóa đề thi (chỉ Admin hoặc người tạo).
     */
    public function deleteForUser(string $id, User $user): bool;
}
