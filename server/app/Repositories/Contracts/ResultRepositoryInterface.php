<?php

namespace App\Repositories\Contracts;

use Illuminate\Database\Eloquent\Collection;

interface ResultRepositoryInterface extends RepositoryInterface
{
    /** Lấy kết quả theo ID lượt thi */
    public function getByAttempt(int|string $attemptId): Collection;
    
    /** Tìm kết quả đầu tiên của một lượt thi */
    public function findByAttempt(int|string $attemptId): ?\Illuminate\Database\Eloquent\Model;
}
