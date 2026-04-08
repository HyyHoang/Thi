<?php

namespace App\Services;

use App\Models\Question;
use App\Models\QuestionBank;
use App\Models\QuestionChapter;
use App\Models\Subject;
use App\Models\User;
use App\Repositories\Contracts\QuestionBankRepositoryInterface;
use App\Services\Contracts\QuestionBankServiceInterface;
use Illuminate\Support\Facades\DB;

class QuestionBankService extends BaseService implements QuestionBankServiceInterface
{
    public function __construct(QuestionBankRepositoryInterface $repository)
    {
        parent::__construct($repository);
    }

    /**
     * {@inheritDoc}
     */
    public function getAllWithSubjectAndCreator(): array
    {
        $banks = $this->repository->getAll();
        $subjectIds = $banks->pluck('SubjectID')->filter()->unique()->values();
        $userIds = $banks->pluck('UserID')->filter()->unique()->values();

        $subjectsById = Subject::query()->whereIn('SubjectID', $subjectIds)->get()->keyBy('SubjectID');
        $usersById = User::query()->whereIn('UserID', $userIds)->get()->keyBy('UserID');

        return $banks->map(function (QuestionBank $bank) use ($subjectsById, $usersById) {
            $subject = $bank->SubjectID ? $subjectsById->get($bank->SubjectID) : null;
            $creator = $bank->UserID ? $usersById->get($bank->UserID) : null;

            return $this->formatBankListRow($bank, $subject, $creator);
        })->all();
    }

    /**
     * {@inheritDoc}
     */
    public function getByIdWithDetails(string $id): array
    {
        QuestionBank::syncQuestionStats($id);

        /** @var QuestionBank $bank */
        $bank = $this->repository->findById($id);
        $subject = $bank->SubjectID
            ? Subject::where('SubjectID', $bank->SubjectID)->first()
            : null;
        $creator = $bank->UserID
            ? User::where('UserID', $bank->UserID)->first()
            : null;

        $chapters = QuestionChapter::query()
            ->where('BankID', $bank->BankID)
            ->orderBy('ChapterNumber')
            ->get();

        $chapterPayload = $chapters->map(function (QuestionChapter $ch) {
            return [
                'chapter_id'     => $ch->ChapterID,
                'chapter_number' => $ch->ChapterNumber,
                'chapter_name'   => $ch->ChapterName,
                'description'    => $ch->Description,
                'question_count' => (int) $ch->QuestionCount,
            ];
        })->all();

        $totalQuestions = Question::query()->where('BankID', $bank->BankID)->count();

        return [
            'bank'             => $this->formatBankListRow($bank, $subject, $creator),
            'chapters'         => $chapterPayload,
            'total_questions'  => $totalQuestions,
        ];
    }

    /**
     * {@inheritDoc}
     */
    public function createForUser(array $data, User $user): array
    {
        return DB::transaction(function () use ($data, $user) {
            $bank = $this->repository->create([
                'BankName'     => $data['bank_name'],
                'SubjectID'    => $data['subject_id'],
                'Description'  => $data['description'] ?? null,
                'UserID'       => $user->UserID,
                'ChapterCount' => 0,
            ]);

            foreach ($data['chapters'] as $row) {
                QuestionChapter::query()->create([
                    'BankID'        => $bank->BankID,
                    'ChapterNumber' => (int) $row['chapter_number'],
                    'ChapterName'   => $row['chapter_name'],
                    'Description'   => $row['description'] ?? null,
                    'QuestionCount' => 0,
                ]);
            }

            $bank->ChapterCount = count($data['chapters']);
            $bank->save();

            $subject = Subject::where('SubjectID', $bank->SubjectID)->first();
            $creator = User::where('UserID', $bank->UserID)->first();

            return $this->formatBankListRow($bank->fresh(), $subject, $creator);
        });
    }

    /**
     * {@inheritDoc}
     */
    public function updateForUser(string $id, array $data, User $user): array
    {
        /** @var QuestionBank $bank */
        $bank = $this->repository->findById($id);
        $this->assertCanModifyBank($bank, $user);

        $hasQuestions = Question::query()->where('BankID', $bank->BankID)->exists();
        if ($hasQuestions && isset($data['subject_id']) && $data['subject_id'] !== $bank->SubjectID) {
            throw new \RuntimeException('Không thể đổi môn học khi ngân hàng đã có câu hỏi.');
        }

        $bank = $this->repository->update($id, [
            'BankName'    => $data['bank_name'],
            'SubjectID'   => $data['subject_id'],
            'Description' => $data['description'] ?? null,
        ]);

        // Xử lý cập nhật danh sách chương nếu có
        if (isset($data['chapters']) && is_array($data['chapters'])) {
            DB::transaction(function () use ($id, $data, $user) {
                foreach ($data['chapters'] as $chData) {
                    if (isset($chData['chapter_id'])) {
                        $this->updateChapterForUser($id, (int)$chData['chapter_id'], [
                            'chapter_number' => $chData['chapter_number'],
                            'chapter_name'   => $chData['chapter_name'],
                            'description'    => $chData['description'] ?? null,
                        ], $user);
                    } else {
                        // Thêm chương mới nếu không có ID
                        $this->createChapterForUser($id, [
                            'chapter_number' => $chData['chapter_number'],
                            'chapter_name'   => $chData['chapter_name'],
                            'description'    => $chData['description'] ?? null,
                        ], $user);
                    }
                }
            });
        }

        $subject = $bank->SubjectID
            ? Subject::where('SubjectID', $bank->SubjectID)->first()
            : null;
        $creator = $bank->UserID
            ? User::where('UserID', $bank->UserID)->first()
            : null;

        return $this->formatBankListRow($bank->fresh(), $subject, $creator);
    }

    /**
     * {@inheritDoc}
     */
    public function deleteForUser(string $id, User $user): bool
    {
        /** @var QuestionBank $bank */
        $bank = $this->repository->findById($id);
        $this->assertCanModifyBank($bank, $user);

        if (Question::query()->where('BankID', $bank->BankID)->exists()) {
            throw new \RuntimeException('Không thể xóa ngân hàng đã có câu hỏi.');
        }

        return $this->repository->delete($bank->BankID);
    }

    /**
     * {@inheritDoc}
     */
    public function createChapterForUser(string $bankId, array $data, User $user): array
    {
        /** @var QuestionBank $bank */
        $bank = $this->repository->findById($bankId);
        $this->assertCanModifyBank($bank, $user);

        $chapter = QuestionChapter::query()->create([
            'BankID'        => $bankId,
            'ChapterNumber' => (int) $data['chapter_number'],
            'ChapterName'   => $data['chapter_name'],
            'Description'   => $data['description'] ?? null,
            'QuestionCount' => 0,
        ]);

        $bank->ChapterCount = QuestionChapter::query()->where('BankID', $bankId)->count();
        $bank->save();

        return [
            'chapter_id'     => $chapter->ChapterID,
            'chapter_number' => $chapter->ChapterNumber,
            'chapter_name'   => $chapter->ChapterName,
            'description'    => $chapter->Description,
            'question_count' => (int) $chapter->QuestionCount,
        ];
    }

    /**
     * {@inheritDoc}
     */
    public function updateChapterForUser(string $bankId, int $chapterId, array $data, User $user): array
    {
        /** @var QuestionBank $bank */
        $bank = $this->repository->findById($bankId);
        $this->assertCanModifyBank($bank, $user);

        $chapter = QuestionChapter::query()
            ->where('BankID', $bankId)
            ->where('ChapterID', $chapterId)
            ->firstOrFail();

        if (isset($data['chapter_number']) && (int) $data['chapter_number'] !== (int) $chapter->ChapterNumber) {
            $oldNumber = (int) $chapter->ChapterNumber;
            $newNumber = (int) $data['chapter_number'];

            $exists = QuestionChapter::query()
                ->where('BankID', $bankId)
                ->where('ChapterNumber', $newNumber)
                ->where('ChapterID', '!=', $chapterId)
                ->exists();
            if ($exists) {
                throw new \RuntimeException('Số chương đã tồn tại trong ngân hàng này.');
            }

            // Cập nhật số chương cho tất cả câu hỏi thuộc chương này
            Question::query()
                ->where('BankID', $bankId)
                ->where('ChapterNumber', $oldNumber)
                ->update(['ChapterNumber' => $newNumber]);

            $chapter->ChapterNumber = $newNumber;
        }

        if (isset($data['chapter_name'])) {
            $chapter->ChapterName = $data['chapter_name'];
        }
        if (array_key_exists('description', $data)) {
            $chapter->Description = $data['description'];
        }
        $chapter->save();

        QuestionBank::syncQuestionStats($bankId);

        $chapter->refresh();

        return [
            'chapter_id'     => $chapter->ChapterID,
            'chapter_number' => $chapter->ChapterNumber,
            'chapter_name'   => $chapter->ChapterName,
            'description'    => $chapter->Description,
            'question_count' => (int) $chapter->QuestionCount,
        ];
    }

    /**
     * {@inheritDoc}
     */
    public function deleteChapterForUser(string $bankId, int $chapterId, User $user): bool
    {
        /** @var QuestionBank $bank */
        $bank = $this->repository->findById($bankId);
        $this->assertCanModifyBank($bank, $user);

        $chapter = QuestionChapter::query()
            ->where('BankID', $bankId)
            ->where('ChapterID', $chapterId)
            ->firstOrFail();

        if ((int) $chapter->QuestionCount > 0) {
            throw new \RuntimeException('Không thể xóa chương đã có câu hỏi.');
        }

        return DB::transaction(function () use ($chapter, $bank, $bankId) {
            $chapter->delete();
            $bank->ChapterCount = QuestionChapter::query()->where('BankID', $bankId)->count();
            $bank->save();

            return true;
        });
    }

    private function assertCanModifyBank(QuestionBank $bank, User $user): void
    {
        $role = (int) $user->Role;
        if ($role === 0) {
            return;
        }
        if ($role === 1 && $bank->UserID === $user->UserID) {
            return;
        }

        abort(403, 'Bạn không có quyền chỉnh sửa ngân hàng này');
    }

    /**
     * {@inheritDoc}
     */
    public function addQuestionsToChapter(string $bankId, int $chapterNumber, array $questionIds, User $user): int
    {
        /** @var QuestionBank $bank */
        $bank = $this->repository->findById($bankId);
        $this->assertCanModifyBank($bank, $user);

        // Frontend truyền chapter_number (không phải ChapterID) lên URL
        $chapter = QuestionChapter::query()
            ->where('BankID', $bankId)
            ->where('ChapterNumber', $chapterNumber)
            ->firstOrFail();

        if (empty($questionIds)) {
            return 0;
        }

        // Cập nhật BankID và ChapterNumber cho các câu hỏi được chọn
        $updated = Question::query()
            ->whereIn('QuestionID', $questionIds)
            ->update([
                'BankID'        => $bankId,
                'ChapterNumber' => $chapter->ChapterNumber,
            ]);

        // Cập nhật lại số lượng câu hỏi trong ngân hàng
        QuestionBank::syncQuestionStats($bankId);

        return $updated;
    }

    /**
     * @return array<string, mixed>
     */
    private function formatBankListRow(QuestionBank $bank, ?Subject $subject, ?User $creator): array
    {
        return [
            'bank_id'          => $bank->BankID,
            'bank_name'        => $bank->BankName,
            'subject_id'       => $bank->SubjectID,
            'subject_name'     => $subject?->SubjectName,
            'chapter_count'    => (int) $bank->ChapterCount,
            'user_id'          => $bank->UserID,
            'creator_username' => $creator?->Username,
            'created_date'     => $bank->CreatedDate?->format('Y-m-d H:i:s'),
            'description'      => $bank->Description,
        ];
    }
}
