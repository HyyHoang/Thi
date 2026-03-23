<?php

namespace App\Services\Contracts;

use App\Models\User;

interface QuestionBankServiceInterface extends ServiceInterface
{
    /**
     * @return array<int, array<string, mixed>>
     */
    public function getAllWithSubjectAndCreator(): array;

    /**
     * @return array<string, mixed>
     */
    public function getByIdWithDetails(string $id): array;

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    public function createForUser(array $data, User $user): array;

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    public function updateForUser(string $id, array $data, User $user): array;

    public function deleteForUser(string $id, User $user): bool;

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    public function createChapterForUser(string $bankId, array $data, User $user): array;

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    public function updateChapterForUser(string $bankId, int $chapterId, array $data, User $user): array;

    public function deleteChapterForUser(string $bankId, int $chapterId, User $user): bool;
}
