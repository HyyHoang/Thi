<?php

namespace App\Services;

use App\Repositories\Contracts\ResultRepositoryInterface;
use App\Repositories\Contracts\StudentAnswerRepositoryInterface;
use App\Services\Contracts\ResultServiceInterface;

class ResultService extends BaseService implements ResultServiceInterface
{
    public function __construct(
        ResultRepositoryInterface $repository,
        private readonly StudentAnswerRepositoryInterface $studentAnswerRepo
    ) {
        parent::__construct($repository);
    }

    public function getAllWithDetails(): array
    {
        // Tối ưu query (N+1)
        $results = $this->repository->getModel()->newQuery()
            ->with(['attempt.student', 'attempt.exam'])
            ->orderByDesc('CreatedAt')
            ->get();

        return $results->map(function ($result) {
            $attempt = $result->attempt;
            return [
                'result_id'       => $result->ResultID,
                'attempt_id'      => $result->AttemptID,
                'score'           => $result->Score,
                'correct_answers' => $result->CorrectAnswers,
                'working_time'    => $result->WorkingTime,
                'created_at'      => $result->CreatedAt,
                
                // Trả về kèm chi tiết phục vụ hiển thị danh sách
                'student_id'      => $attempt?->StudentID,
                'student_name'    => $attempt?->student?->FirstName . ' ' . $attempt?->student?->LastName,
                'exam_id'         => $attempt?->ExamID,
                'exam_title'      => $attempt?->exam?->Title,
            ];
        })->toArray();
    }

    public function getDetails(int|string $id): array
    {
        $result = $this->repository->findById($id);
        $result->load(['attempt.student', 'attempt.exam']);
        
        $answers = $this->studentAnswerRepo->getByResult($id);

        $attempt = $result->attempt;

        return [
            'result_id'       => $result->ResultID,
            'attempt_id'      => $result->AttemptID,
            'score'           => $result->Score,
            'correct_answers' => $result->CorrectAnswers,
            'working_time'    => $result->WorkingTime,
            'created_at'      => $result->CreatedAt,
            'student'         => $attempt?->student ? [
                'student_id'   => $attempt->student->StudentID,
                'student_name' => trim($attempt->student->FirstName . ' ' . $attempt->student->LastName),
            ] : null,
            'exam'            => $attempt?->exam ? [
                'exam_id'    => $attempt->exam->ExamID,
                'exam_title' => $attempt->exam->Title,
            ] : null,
            'student_answers' => $answers->map(fn($ans) => [
                'student_answer_id' => $ans->StudentAnswerID,
                'question_id'       => $ans->QuestionID,
                'content'           => $ans->question?->Content,
                'selected_answer'   => $ans->SelectedAnswer,
                'is_correct'        => clone $ans->IsCorrect, // Ép kiểu nếu cần
                'correct_answer'    => $ans->question?->CorrectAnswer,
            ])->toArray()
        ];
    }

    public function getDetailsByAttempt(int|string $attemptId): array
    {
        /** @var \App\Repositories\Contracts\ResultRepositoryInterface $repo */
        $repo = $this->repository;
        $result = $repo->findByAttempt($attemptId);
        
        if (!$result) {
            throw new \RuntimeException('Không tìm thấy kết quả cho lượt làm bài này.');
        }

        return $this->getDetails($result->ResultID);
    }

    public function createResult(array $data): array
    {
        // Logic tính toán điểm số thường nằm ở đây, nhưng tạm thời lưu theo data truyền vào
        $result = $this->repository->create([
            'AttemptID'      => $data['attempt_id'],
            'CorrectAnswers' => $data['correct_answers'] ?? 0,
            'Score'          => $data['score'] ?? 0,
            'WorkingTime'    => $data['working_time'] ?? 0,
        ]);

        return $result->toArray();
    }
}
