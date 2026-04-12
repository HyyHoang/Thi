<?php

namespace App\Repositories\Contracts;

interface ExamAttemptRepositoryInterface extends RepositoryInterface
{
    /** Lấy tất cả lượt làm theo ExamID */
    public function getByExam(string $examId): \Illuminate\Database\Eloquent\Collection;

    /** Lấy tất cả lượt làm của một sinh viên */
    public function getByStudent(string $studentId): \Illuminate\Database\Eloquent\Collection;
}
