<?php

namespace App\Repositories\Contracts;

use Illuminate\Database\Eloquent\Collection;

interface StudentAnswerRepositoryInterface extends RepositoryInterface
{
    /** Lấy tất cả câu trả lời theo ID Kết quả */
    public function getByResult(int|string $resultId): Collection;
}
