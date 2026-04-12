<?php

namespace App\Services;

use App\Models\CourseSection;
use App\Models\Exam;
use App\Models\ExamChapterConfig;
use App\Models\Question;
use App\Models\QuestionBank;
use App\Models\QuestionChapter;
use App\Models\Semester;
use App\Models\Subject;
use App\Models\User;
use App\Repositories\Contracts\ExamRepositoryInterface;
use App\Services\Contracts\ExamServiceInterface;
use Illuminate\Support\Facades\DB;

class ExamService extends BaseService implements ExamServiceInterface
{
    public function __construct(ExamRepositoryInterface $repository)
    {
        parent::__construct($repository);
    }

    // ─────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────

    public function getCurrentSemester(): ?array
    {
        $today = now()->toDateString();
        $semester = Semester::query()
            ->where('StartDate', '<=', $today)
            ->where('EndDate', '>=', $today)
            ->first();

        if (!$semester) {
            return null;
        }

        return [
            'semester_id'   => $semester->SemesterID,
            'semester_name' => $semester->SemesterName,
            'academic_year' => $semester->AcademicYear,
            'start_date'    => $semester->StartDate,
            'end_date'      => $semester->EndDate,
        ];
    }

    public function getSubjectsForSemester(string $semesterId): array
    {
        $subjectIds = CourseSection::query()
            ->where('SemesterID', $semesterId)
            ->pluck('SubjectID')
            ->unique()
            ->values();

        $subjects = Subject::query()
            ->whereIn('SubjectID', $subjectIds)
            ->get();

        return $subjects->map(fn(Subject $s) => [
            'subject_id'   => $s->SubjectID,
            'subject_name' => $s->SubjectName,
        ])->all();
    }

    public function getBanksForSubject(string $subjectId): array
    {
        $banks = QuestionBank::query()
            ->where('SubjectID', $subjectId)
            ->get();

        return $banks->map(function (QuestionBank $bank) {
            $chapters = QuestionChapter::query()
                ->where('BankID', $bank->BankID)
                ->orderBy('ChapterNumber')
                ->get();

            return [
                'bank_id'   => $bank->BankID,
                'bank_name' => $bank->BankName,
                'subject_id' => $bank->SubjectID,
                'chapters'  => $chapters->map(fn(QuestionChapter $ch) => [
                    'chapter_id'     => $ch->ChapterID,
                    'chapter_number' => $ch->ChapterNumber,
                    'chapter_name'   => $ch->ChapterName,
                    'question_count' => (int) $ch->QuestionCount,
                ])->all(),
            ];
        })->all();
    }

    // ─────────────────────────────────────────────
    // CRUD
    // ─────────────────────────────────────────────

    public function getAllForUser(User $user): array
    {
        $exams = Exam::query()
            ->with(['courseSection.subject', 'courseSection.semester', 'creator'])
            ->get();

        return $exams->map(fn(Exam $e) => $this->formatExam($e))->all();
    }

    public function getDetail(string $id): array
    {
        /** @var Exam $exam */
        $exam = Exam::query()
            ->with(['courseSection.subject', 'courseSection.semester', 'creator', 'chapterConfigs.bank'])
            ->where('ExamID', $id)
            ->firstOrFail();

        $data = $this->formatExam($exam);

        $data['chapter_configs'] = $exam->chapterConfigs->map(fn(ExamChapterConfig $cfg) => [
            'config_id'      => $cfg->ConfigID,
            'bank_id'        => $cfg->BankID,
            'bank_name'      => $cfg->bank?->BankName,
            'chapter_number' => $cfg->ChapterNumber,
            'question_count' => $cfg->QuestionCount,
        ])->all();

        return $data;
    }

    public function createForUser(array $data, User $user): array
    {
        return DB::transaction(function () use ($data, $user) {
            $chapterConfigs = $data['chapter_configs'];
            $totalQuestions = 0;

            // Validate: mỗi chương phải đủ câu hỏi
            foreach ($chapterConfigs as $cfg) {
                $available = Question::query()
                    ->where('BankID', $cfg['bank_id'])
                    ->where('ChapterNumber', $cfg['chapter_number'])
                    ->count();

                if ($available < (int) $cfg['question_count']) {
                    $chapter = QuestionChapter::query()
                        ->where('BankID', $cfg['bank_id'])
                        ->where('ChapterNumber', $cfg['chapter_number'])
                        ->first();
                    $chapterName = $chapter?->ChapterName ?? ('Chương ' . $cfg['chapter_number']);
                    throw new \RuntimeException(
                        "Chương \"{$chapterName}\" chỉ có {$available} câu hỏi, không đủ để lấy {$cfg['question_count']} câu."
                    );
                }
                $totalQuestions += (int) $cfg['question_count'];
            }

            // Tạo Exam
            /** @var Exam $exam */
            $exam = $this->repository->create([
                'SectionID'     => $data['section_id'],
                'Title'         => $data['title'],
                'Duration'      => (int) $data['duration'],
                'QuestionCount' => $totalQuestions,
                'PasswordExam'  => !empty($data['password_exam']) ? $data['password_exam'] : null,
                'IsFullscreen'  => !empty($data['is_fullscreen']),
                'IsPreventCopy' => !empty($data['is_prevent_copy']),
                'StartTime'     => $data['start_time'],
                'EndTime'       => $data['end_time'],
                'CreatedBy'     => $user->UserID,
            ]);

            // Tạo chapter configs
            foreach ($chapterConfigs as $cfg) {
                ExamChapterConfig::query()->create([
                    'ExamID'        => $exam->ExamID,
                    'BankID'        => $cfg['bank_id'],
                    'ChapterNumber' => (int) $cfg['chapter_number'],
                    'QuestionCount' => (int) $cfg['question_count'],
                ]);
            }

            return $this->getDetail($exam->ExamID);
        });
    }

    public function updateForUser(string $id, array $data, User $user): array
    {
        /** @var Exam $exam */
        $exam = $this->repository->findById($id);
        $this->assertCanModify($exam, $user);

        return DB::transaction(function () use ($exam, $data) {
            $chapterConfigs = $data['chapter_configs'] ?? [];
            $totalQuestions = 0;

            if (!empty($chapterConfigs)) {
                // Validate
                foreach ($chapterConfigs as $cfg) {
                    $available = Question::query()
                        ->where('BankID', $cfg['bank_id'])
                        ->where('ChapterNumber', $cfg['chapter_number'])
                        ->count();

                    if ($available < (int) $cfg['question_count']) {
                        $chapter = QuestionChapter::query()
                            ->where('BankID', $cfg['bank_id'])
                            ->where('ChapterNumber', $cfg['chapter_number'])
                            ->first();
                        $chapterName = $chapter?->ChapterName ?? ('Chương ' . $cfg['chapter_number']);
                        throw new \RuntimeException(
                            "Chương \"{$chapterName}\" chỉ có {$available} câu hỏi, không đủ để lấy {$cfg['question_count']} câu."
                        );
                    }
                    $totalQuestions += (int) $cfg['question_count'];
                }

                // Xóa configs cũ → thêm mới
                ExamChapterConfig::query()->where('ExamID', $exam->ExamID)->delete();
                foreach ($chapterConfigs as $cfg) {
                    ExamChapterConfig::query()->create([
                        'ExamID'        => $exam->ExamID,
                        'BankID'        => $cfg['bank_id'],
                        'ChapterNumber' => (int) $cfg['chapter_number'],
                        'QuestionCount' => (int) $cfg['question_count'],
                    ]);
                }
            } else {
                $totalQuestions = $exam->QuestionCount;
            }

            $updateData = [
                'Title'         => $data['title'] ?? $exam->Title,
                'Duration'      => isset($data['duration']) ? (int) $data['duration'] : $exam->Duration,
                'QuestionCount' => $totalQuestions,
                'PasswordExam'  => array_key_exists('password_exam', $data)
                    ? (!empty($data['password_exam']) ? $data['password_exam'] : null)
                    : $exam->PasswordExam,
                'IsFullscreen'  => isset($data['is_fullscreen']) ? (bool) $data['is_fullscreen'] : $exam->IsFullscreen,
                'IsPreventCopy' => isset($data['is_prevent_copy']) ? (bool) $data['is_prevent_copy'] : $exam->IsPreventCopy,
                'StartTime'     => $data['start_time'] ?? $exam->StartTime,
                'EndTime'       => $data['end_time'] ?? $exam->EndTime,
            ];

            $this->repository->update($exam->ExamID, $updateData);

            return $this->getDetail($exam->ExamID);
        });
    }

    public function deleteForUser(string $id, User $user): bool
    {
        /** @var Exam $exam */
        $exam = $this->repository->findById($id);
        $this->assertCanModify($exam, $user);

        return $this->repository->delete($id);
    }

    // ─────────────────────────────────────────────
    // Private helpers
    // ─────────────────────────────────────────────

    private function assertCanModify(Exam $exam, User $user): void
    {
        $role = (int) $user->Role;
        if ($role === 0) return; // Admin
        if ($role === 1 && $exam->CreatedBy === $user->UserID) return; // Teacher tạo

        abort(403, 'Bạn không có quyền chỉnh sửa đề thi này.');
    }

    private function formatExam(Exam $exam): array
    {
        $section  = $exam->courseSection;
        $subject  = $section?->subject;
        $semester = $section?->semester;
        $creator  = $exam->creator;

        return [
            'exam_id'          => $exam->ExamID,
            'title'            => $exam->Title,
            'section_id'       => $exam->SectionID,
            'section_name'     => $section?->SectionName,
            'subject_id'       => $subject?->SubjectID,
            'subject_name'     => $subject?->SubjectName,
            'semester_id'      => $semester?->SemesterID,
            'semester_name'    => $semester?->SemesterName,
            'duration'         => (int) $exam->Duration,
            'question_count'   => (int) $exam->QuestionCount,
            'password_enabled' => !is_null($exam->PasswordExam),
            'is_fullscreen'    => (bool) $exam->IsFullscreen,
            'is_prevent_copy'  => (bool) $exam->IsPreventCopy,
            'start_time'       => $exam->StartTime?->format('Y-m-d H:i:s'),
            'end_time'         => $exam->EndTime?->format('Y-m-d H:i:s'),
            'created_by'       => $exam->CreatedBy,
            'creator_username' => $creator?->Username,
            'created_date'     => $exam->CreatedDate?->format('Y-m-d H:i:s'),
            'chapter_configs'  => [],
        ];
    }
}
