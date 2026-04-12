<?php

namespace App\Repositories;

use App\Models\Exam;
use App\Repositories\Contracts\ExamRepositoryInterface;

class ExamRepository extends BaseRepository implements ExamRepositoryInterface
{
    public function __construct(Exam $model)
    {
        parent::__construct($model);
    }
}
