<?php

namespace App\Services\Contracts;

interface TeacherProfileServiceInterface extends ServiceInterface
{
    public function getAllFormatted(): array;
    public function getByIdFormatted(int $id): array;
    public function getByUserIdFormatted(int $userId): array;
    public function create(array $data): array;
    public function update(int $id, array $data): array;
    public function updateMyProfile(int $userId, array $data): array;
    public function delete(int $id): bool;
}
