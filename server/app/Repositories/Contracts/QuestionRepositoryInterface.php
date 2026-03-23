<?php

namespace App\Repositories\Contracts;

use Illuminate\Support\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

interface QuestionRepositoryInterface extends RepositoryInterface
{
    /**
     * Get all questions with options.
     */
    public function getAllWithOptions(): Collection;

    /**
     * Get paginated questions with options.
     */
    public function getPaginatedWithOptions(int $perPage = 15, string $search = '', ?string $type = null): LengthAwarePaginator;

    /**
     * Get questions by UserID.
     */
    public function getByUserId(string $userId): Collection;
    
    /**
     * Find a question with its options.
     */
    public function findWithOptions(string $id);
}
