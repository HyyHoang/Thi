<?php

namespace App\Repositories;

use App\Models\ExamAttempt;
use App\Repositories\Contracts\ExamAttemptRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class ExamAttemptRepository extends BaseRepository implements ExamAttemptRepositoryInterface
{
    public function __construct(ExamAttempt $model)
    {
        parent::__construct($model);
    }

    public function getByExam(string $examId): Collection
    {
        return ExamAttempt::query()
            ->where('ExamID', $examId)
            ->with(['student'])
            ->orderByDesc('StartTime')
            ->get();
    }

    public function getByStudent(string $studentId): Collection
    {
        return ExamAttempt::query()
            ->where('StudentID', $studentId)
            ->with(['exam'])
            ->orderByDesc('StartTime')
            ->get();
    }
}
