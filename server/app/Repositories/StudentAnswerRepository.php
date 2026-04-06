<?php

namespace App\Repositories;

use App\Models\StudentAnswer;
use App\Repositories\Contracts\StudentAnswerRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class StudentAnswerRepository extends BaseRepository implements StudentAnswerRepositoryInterface
{
    public function __construct(StudentAnswer $model)
    {
        parent::__construct($model);
    }

    public function getByResult(int|string $resultId): Collection
    {
        return $this->model->newQuery()
            ->where('ResultID', $resultId)
            ->with(['question']) // Kèm theo nội dung câu hỏi
            ->get();
    }
}
