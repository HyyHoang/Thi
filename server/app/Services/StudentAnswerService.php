<?php

namespace App\Services;

use App\Repositories\Contracts\StudentAnswerRepositoryInterface;
use App\Services\Contracts\StudentAnswerServiceInterface;

class StudentAnswerService extends BaseService implements StudentAnswerServiceInterface
{
    public function __construct(StudentAnswerRepositoryInterface $repository)
    {
        parent::__construct($repository);
    }

    public function saveMultiple(int|string $resultId, array $answers): void
    {
        foreach ($answers as $ans) {
            $this->repository->create([
                'ResultID'       => $resultId,
                'QuestionID'     => $ans['question_id'],
                'SelectedAnswer' => $ans['selected_answer'] ?? null,
                'IsCorrect'      => $ans['is_correct'] ?? false,
            ]);
        }
    }
}
