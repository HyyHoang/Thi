<?php

namespace App\Services;

use App\Models\QuestionBank;
use App\Models\QuestionChapter;
use App\Models\Subject;
use App\Repositories\Contracts\QuestionRepositoryInterface;
use App\Services\Contracts\QuestionServiceInterface;
use Illuminate\Http\UploadedFile;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use PhpOffice\PhpSpreadsheet\IOFactory;

class QuestionService extends BaseService implements QuestionServiceInterface
{
    protected QuestionRepositoryInterface $questionRepository;

    public function __construct(QuestionRepositoryInterface $questionRepository)
    {
        parent::__construct($questionRepository);
        $this->questionRepository = $questionRepository;
    }

    public function getAllQuestions(): Collection
    {
        return $this->questionRepository->getAllWithOptions();
    }

    public function getPaginatedQuestions(int $perPage = 15, string $search = '', ?string $type = null, array $filters = []): LengthAwarePaginator
    {
        return $this->questionRepository->getPaginatedWithOptions($perPage, $search, $type, $filters);
    }

    public function importFromCsv(UploadedFile $file, string $userId, ?string $defaultSubjectId = null): array
    {
        $rows = [];
        $path = $file->getRealPath();
        $handle = fopen($path, 'r');
        if (!$handle) {
            throw new \RuntimeException('Không thể đọc file');
        }
        $bom = fread($handle, 3);
        if ($bom !== "\xEF\xBB\xBF") {
            rewind($handle);
        }
        while (($row = fgetcsv($handle)) !== false) {
            $rows[] = array_map('strval', $row);
        }
        fclose($handle);
        return $this->importFromRows($rows, $userId, $defaultSubjectId);
    }

    public function importFromXlsx(UploadedFile $file, string $userId, ?string $defaultSubjectId = null): array
    {
        try {
            $spreadsheet = IOFactory::load($file->getRealPath());
        } catch (\Throwable $e) {
            throw new \RuntimeException('Không thể đọc file Excel: ' . $e->getMessage());
        }
        $sheet = $spreadsheet->getActiveSheet();
        $rows = $sheet->toArray(null, false, false, false);
        $rows = array_map(function ($row) {
            $arr = is_array($row) ? $row : [$row];
            return array_values(array_map('strval', $arr));
        }, $rows);
        return $this->importFromRows($rows, $userId, $defaultSubjectId);
    }

    private function resolveHeaderIndex(array $header, array $aliases): ?int
    {
        foreach ($aliases as $alias) {
            $idx = array_search($alias, $header);
            if ($idx !== false) {
                return $idx;
            }
        }
        return null;
    }

    private function normalizeType(string $type): string
    {
        $t = strtolower(trim($type));
        $map = [
            'single' => 'single', '1' => 'single', 'một' => 'single', 'mot' => 'single',
            'trắc nghiệm 1 đáp án' => 'single', 'trac nghiem 1 dap an' => 'single',
            'multiple' => 'multiple', '2' => 'multiple', 'nhiều' => 'multiple', 'nhieu' => 'multiple',
            'trắc nghiệm nhiều đáp án' => 'multiple', 'trac nghiem nhieu dap an' => 'multiple',
            'essay' => 'essay', '3' => 'essay', 'tự luận' => 'essay', 'tu luan' => 'essay',
        ];
        return $map[$t] ?? 'single';
    }

    private function importFromRows(array $rows, string $userId, ?string $defaultSubjectId = null): array
    {
        $imported = 0;
        $errors = [];

        if (empty($rows)) {
            throw new \RuntimeException('File rỗng hoặc không hợp lệ');
        }

        $rawHeader = array_map(fn ($v) => strtolower(trim((string) $v)), $rows[0]);
        $header = $rawHeader;

        try {
            return $this->processImportRows($rows, $header, $userId, $defaultSubjectId);
        } finally {
            // Đảm bảo không còn transaction nào bị kẹt do lỗi bất ngờ
            while (DB::transactionLevel() > 0) {
                DB::rollBack();
            }
        }
    }

    private function processImportRows(array $rows, array $header, string $userId, ?string $defaultSubjectId): array
    {
        $imported = 0;
        $errors = [];
        
        $contentIdx = $this->resolveHeaderIndex($header, [
            'content', 'noidung', 'nội dung', 'noi dung', 'câu hỏi', 'cau hoi', 'câu', 'nội dung câu hỏi',
        ]);
        $typeIdx = $this->resolveHeaderIndex($header, [
            'type', 'loại', 'loai', 'kiểu', 'kieu', 'dạng', 'dang',
        ]);
        $subjectIdx = $this->resolveHeaderIndex($header, [
            'subject', 'subjectname', 'subject name', 'môn học', 'mon hoc', 'tên môn học', 'ten mon hoc',
            'môn', 'mon', 'mã môn học', 'ma mon hoc', 'subjectid',
        ]);

        if ($contentIdx === null || $typeIdx === null) {
            $found = implode(', ', array_filter($header));
            throw new \RuntimeException(
                'File cần có cột nội dung (content/noidung) và loại (type/loại). Cột tìm thấy: ' . ($found ?: '(trống)')
            );
        }

        for ($i = 1, $n = count($rows); $i < $n; $i++) {
            $row = $rows[$i];
            if (!is_array($row)) {
                $row = [$row];
            }
            $row = array_values(array_map('strval', $row));
            $rowNum = $i + 1;

            $content = trim((string) ($row[$contentIdx] ?? ''));
            $type = $this->normalizeType((string) ($row[$typeIdx] ?? 'single'));

            $subjectId = null;
            if ($subjectIdx !== null) {
                $subjectName = trim((string) ($row[$subjectIdx] ?? ''));
                if (!empty($subjectName)) {
                    $subject = Subject::where('SubjectName', $subjectName)->first();
                    if ($subject) {
                        $subjectId = $subject->SubjectID;
                    } else {
                        $errors[] = "Dòng {$rowNum}: Không tìm thấy môn học \"{$subjectName}\" trên hệ thống.";
                    }
                }
            }
            
            if (!$subjectId && $defaultSubjectId) {
                $subjectId = $defaultSubjectId;
            }

            if (!$subjectId) {
                 $errors[] = "Dòng {$rowNum}: Thiết môn học. Vui lòng thêm cột môn học hoặc chọn môn học ở form import.";
                 continue;
            }

            $options = [];
            for ($j = 1; $j <= 10; $j++) {
                $optIdx = $this->resolveHeaderIndex($header, [
                    "option{$j}", "option {$j}", "đáp án {$j}", "dap an {$j}", "đáp án{$j}", "dapan{$j}",
                    "option $j", "đáp án $j",
                ]);
                $corIdx = $this->resolveHeaderIndex($header, [
                    "correct{$j}", "correct {$j}", "đúng {$j}", "dung {$j}", "correct$j", "đúng$j",
                    "correct $j", "đúng $j", "correct{$j}",
                ]);
                if ($optIdx !== null && !empty(trim((string) ($row[$optIdx] ?? '')))) {
                    $optContent = trim((string) $row[$optIdx]);
                    $isCorrect = false;
                    if ($corIdx !== null) {
                        $val = strtolower(trim((string) ($row[$corIdx] ?? '')));
                        $isCorrect = in_array($val, ['1', 'true', 'yes', 'x', 'đúng', 'đ', 'dung', 'có', 'co']);
                    }
                    $options[] = ['Content' => $optContent, 'IsCorrect' => $isCorrect, 'OrderNumber' => $j];
                }
            }

            $correctAnswer = '';
            $caIdx = $this->resolveHeaderIndex($header, [
                'correctanswer', 'correct answer', 'đáp án', 'dap an', 'đáp án mẫu', 'dap an mau',
            ]);
            if ($caIdx !== null && !empty(trim((string) ($row[$caIdx] ?? '')))) {
                $correctAnswer = trim((string) $row[$caIdx]);
            } elseif ($type === 'essay' && !empty($options)) {
                $correctAnswer = $options[0]['Content'] ?? '';
                $options = [];
            }

            if (empty($content)) {
                continue;
            }

            $content = mb_substr($content, 0, 255);
            $correctAnswer = mb_substr($correctAnswer, 0, 100);

            try {
                DB::transaction(function () use ($content, $type, $options, $correctAnswer, $userId, $subjectId, &$imported) {
                    $questionData = [
                        'SubjectID' => $subjectId,
                        'BankID' => null,
                        'ChapterNumber' => null,
                        'Content' => $content,
                        'CorrectAnswer' => $correctAnswer,
                        'UserID' => $userId,
                        'Type' => $type,
                    ];
                    $question = $this->questionRepository->create($questionData);
                    foreach ($options as $idx => $opt) {
                        $question->options()->create([
                            'Content' => mb_substr($opt['Content'], 0, 65535),
                            'IsCorrect' => $opt['IsCorrect'],
                            'OrderNumber' => $idx + 1,
                        ]);
                    }
                    $imported++;
                });
            } catch (\Throwable $e) {
                $errors[] = "Dòng {$rowNum}: " . $e->getMessage();
            }
        }

        return ['imported' => $imported, 'errors' => $errors];
    }

    public function createQuestion(array $data)
    {
        return DB::transaction(function () use ($data) {
            $questionData = collect($data)->except(['options'])->toArray();
            $this->normalizeQuestionBankSubject($questionData);
            $question = $this->questionRepository->create($questionData);

            if (isset($data['options']) && is_array($data['options']) && in_array($questionData['Type'], ['single', 'multiple'])) {
                foreach ($data['options'] as $index => $optionData) {
                    $question->options()->create([
                        'Content' => $optionData['Content'] ?? '',
                        'IsCorrect' => $optionData['IsCorrect'] ?? false,
                        'OrderNumber' => $optionData['OrderNumber'] ?? $index + 1,
                    ]);
                }
            }

            if (!empty($questionData['BankID'])) {
                QuestionBank::syncQuestionStats($questionData['BankID']);
            }

            return $question->load('options');
        });
    }

    public function updateQuestion(string $id, array $data)
    {
        return DB::transaction(function () use ($id, $data) {
            $existing = $this->questionRepository->findById($id);
            $oldBankId = $existing->BankID;

            $questionData = collect($data)->except(['options'])->toArray();
            $merged = array_merge([
                'SubjectID'     => $existing->SubjectID,
                'BankID'        => $existing->BankID,
                'ChapterNumber' => $existing->ChapterNumber,
            ], $questionData);
            $this->normalizeQuestionBankSubject($merged);
            if (array_key_exists('SubjectID', $merged)) {
                $questionData['SubjectID'] = $merged['SubjectID'];
            }
            if (array_key_exists('BankID', $merged)) {
                $questionData['BankID'] = $merged['BankID'];
            }
            if (array_key_exists('ChapterNumber', $merged)) {
                $questionData['ChapterNumber'] = $merged['ChapterNumber'];
            }

            $this->questionRepository->update($id, $questionData);

            $question = $this->questionRepository->findById($id);

            if (isset($data['options']) && is_array($data['options']) && in_array($questionData['Type'] ?? $question->Type, ['single', 'multiple'])) {
                $question->options()->delete();

                foreach ($data['options'] as $index => $optionData) {
                    $question->options()->create([
                        'Content' => $optionData['Content'] ?? '',
                        'IsCorrect' => $optionData['IsCorrect'] ?? false,
                        'OrderNumber' => $optionData['OrderNumber'] ?? $index + 1,
                    ]);
                }
            } elseif (isset($data['Type']) && $data['Type'] === 'essay') {
                $question->options()->delete();
            }

            $bankIds = array_unique(array_filter([$oldBankId, $question->BankID]));
            foreach ($bankIds as $bid) {
                QuestionBank::syncQuestionStats($bid);
            }

            return $question->load('options');
        });
    }

    public function deleteQuestion(string $id)
    {
        return DB::transaction(function () use ($id) {
            $question = $this->questionRepository->findById($id);
            if ($question) {
                $bankId = $question->BankID;
                $question->options()->delete();
                $this->questionRepository->delete($id);
                if (!empty($bankId)) {
                    QuestionBank::syncQuestionStats($bankId);
                }
                return true;
            }
            return false;
        });
    }

    public function findQuestionById(string $id)
    {
        return $this->questionRepository->findWithOptions($id);
    }

    /**
     * Đảm bảo câu hỏi gắn ngân hàng cùng môn; nếu có ChapterNumber thì chương phải tồn tại.
     *
     * @param  array<string, mixed>  $data
     */
    private function normalizeQuestionBankSubject(array &$data): void
    {
        if (empty($data['BankID'])) {
            return;
        }

        $bank = QuestionBank::query()->where('BankID', $data['BankID'])->first();
        if (!$bank) {
            throw new \RuntimeException('Ngân hàng câu hỏi không tồn tại.');
        }

        if (!empty($data['SubjectID']) && $data['SubjectID'] !== $bank->SubjectID) {
            throw new \RuntimeException('Câu hỏi không thuộc môn học của ngân hàng.');
        }

        if (empty($data['SubjectID'])) {
            $data['SubjectID'] = $bank->SubjectID;
        }

        if (!empty($data['ChapterNumber'])) {
            $exists = QuestionChapter::query()
                ->where('BankID', $data['BankID'])
                ->where('ChapterNumber', $data['ChapterNumber'])
                ->exists();
            if (!$exists) {
                throw new \RuntimeException('Chương không tồn tại trong ngân hàng này.');
            }
        }
    }
}
