<?php

namespace App\Services;

use App\Models\ExamAttempt;
use App\Models\User;
use App\Repositories\Contracts\ExamAttemptRepositoryInterface;
use App\Services\Contracts\ExamAttemptServiceInterface;

class ExamAttemptService extends BaseService implements ExamAttemptServiceInterface
{
    public function __construct(ExamAttemptRepositoryInterface $repository)
    {
        parent::__construct($repository);
    }

    // ─── List methods ────────────────────────────────────────────

    public function getAll(): array
    {
        $attempts = ExamAttempt::query()
            ->with(['exam.courseSection.subject', 'student'])
            ->orderByDesc('StartTime')
            ->get();

        return $attempts->map(fn(ExamAttempt $a) => $this->format($a))->all();
    }

    public function getAllByExam(string $examId): array
    {
        $attempts = $this->repository->getByExam($examId);

        return $attempts->map(fn(ExamAttempt $a) => $this->format($a))->all();
    }

    public function getAllByStudent(string $studentId): array
    {
        $attempts = $this->repository->getByStudent($studentId);

        return $attempts->map(fn(ExamAttempt $a) => $this->format($a))->all();
    }

    // ─── Detail ──────────────────────────────────────────────────

    public function getDetail(int $id): array
    {
        /** @var ExamAttempt $attempt */
        $attempt = ExamAttempt::query()
            ->with(['exam.courseSection.subject', 'exam.courseSection.semester', 'student'])
            ->where('AttemptID', $id)
            ->firstOrFail();

        return $this->format($attempt);
    }

    // ─── Create ──────────────────────────────────────────────────

    public function create(array $data): array
    {
        /** @var ExamAttempt $attempt */
        $attempt = $this->repository->create([
            'ExamID'    => $data['exam_id'],
            'StudentID' => $data['student_id'],
            'StartTime' => now(),
            'Status'    => 'in_progress',
            'IPAddress' => $data['ip_address'] ?? null,
        ]);

        return $this->getDetail($attempt->AttemptID);
    }

    // ─── Update ──────────────────────────────────────────────────

    public function updateAttempt(int $id, array $data, User $user): array
    {
        /** @var ExamAttempt $attempt */
        $attempt = $this->repository->findById($id);

        // Admin có thể sửa bất cứ gì; Teacher không được sửa trực tiếp
        if ((int) $user->Role !== 0) {
            abort(403, 'Chỉ Admin mới được cập nhật lượt làm bài.');
        }

        $updateData = [];
        if (isset($data['status']))      $updateData['Status']     = $data['status'];
        if (isset($data['submit_time'])) $updateData['SubmitTime'] = $data['submit_time'];
        if (isset($data['ip_address']))  $updateData['IPAddress']  = $data['ip_address'];

        $this->repository->update($id, $updateData);

        return $this->getDetail($id);
    }

    // ─── Delete ──────────────────────────────────────────────────

    public function deleteAttempt(int $id, User $user): bool
    {
        if ((int) $user->Role !== 0) {
            abort(403, 'Chỉ Admin mới được xóa lượt làm bài.');
        }

        return $this->repository->delete($id);
    }

    // ─── Private helpers ─────────────────────────────────────────

    private function format(ExamAttempt $a): array
    {
        $exam    = $a->exam;
        $section = $exam?->courseSection;
        $subject = $section?->subject;
        $semester = $section?->semester;
        $student = $a->student;

        return [
            'attempt_id'    => $a->AttemptID,
            'exam_id'       => $a->ExamID,
            'exam_title'    => $exam?->Title,
            'subject_name'  => $subject?->SubjectName,
            'semester_name' => $semester?->SemesterName,
            'section_name'  => $section?->SectionName,
            'student_id'    => $a->StudentID,
            'student_name'  => $student?->FullName,
            'start_time'    => $a->StartTime?->format('Y-m-d H:i:s'),
            'submit_time'   => $a->SubmitTime?->format('Y-m-d H:i:s'),
            'status'        => $a->Status,
            'ip_address'    => $a->IPAddress,
        ];
    }
}
