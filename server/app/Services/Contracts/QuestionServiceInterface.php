<?php

namespace App\Services\Contracts;

use Illuminate\Http\UploadedFile;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

interface QuestionServiceInterface extends ServiceInterface
{
    /**
     * Get all questions.
     */
    public function getAllQuestions(): Collection;

    /**
     * Get paginated questions.
     */
    public function getPaginatedQuestions(int $perPage = 15, string $search = '', ?string $type = null, array $filters = []): LengthAwarePaginator;

    /**
     * Import questions from CSV file.
     */
    public function importFromCsv(UploadedFile $file, string $userId): array;

    /**
     * Import questions from XLSX file.
     */
    public function importFromXlsx(UploadedFile $file, string $userId): array;
    
    /**
     * Create question with its nested options.
     */
    public function createQuestion(array $data);

    /**
     * Update question and its nested options.
     */
    public function updateQuestion(string $id, array $data);

    /**
     * Delete question.
     */
    public function deleteQuestion(string $id);
    
    /**
     * Find question with options by ID.
     */
    public function findQuestionById(string $id);
}
