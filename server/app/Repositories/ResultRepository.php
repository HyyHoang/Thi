<?php

namespace App\Repositories;

use App\Models\Result;
use App\Repositories\Contracts\ResultRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class ResultRepository extends BaseRepository implements ResultRepositoryInterface
{
    public function __construct(Result $model)
    {
        parent::__construct($model);
    }

    public function getByAttempt(int|string $attemptId): Collection
    {
        return $this->model->newQuery()
            ->where('AttemptID', $attemptId)
            ->get();
    }

    public function findByAttempt(int|string $attemptId): ?\Illuminate\Database\Eloquent\Model
    {
        return $this->model->newQuery()
            ->where('AttemptID', $attemptId)
            ->first();
    }
}
