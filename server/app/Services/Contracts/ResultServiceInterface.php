<?php

namespace App\Services\Contracts;

interface ResultServiceInterface extends ServiceInterface
{
    /** Lấy danh sách kết quả kèm theo thông tin bài làm (ExamAttempt), sinh viên, và bài thi */
    public function getAllWithDetails(): array;

    /** Lấy chi tiết kết quả (kèm chi tiết các câu trả lời) */
    public function getDetails(int|string $id): array;

    /** Lấy chi tiết kết quả thông qua AttemptID */
    public function getDetailsByAttempt(int|string $attemptId): array;

    /** Tạo mới Kết quả từ dữ liệu nộp bài */
    public function createResult(array $data): array;
}
