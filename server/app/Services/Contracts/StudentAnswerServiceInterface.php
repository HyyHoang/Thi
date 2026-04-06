<?php

namespace App\Services\Contracts;

interface StudentAnswerServiceInterface extends ServiceInterface
{
    /** Lưu lại nhiều câu trả lời cùng lúc */
    public function saveMultiple(int|string $resultId, array $answers): void;
}
