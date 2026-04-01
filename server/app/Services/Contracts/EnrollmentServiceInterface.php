<?php

namespace App\Services\Contracts;

interface EnrollmentServiceInterface extends ServiceInterface
{
    public function getAllWithRelations(): array;
    public function getByIdWithRelations(string $id): array;
    public function getByStudentId(string $studentId): array;
    public function getByTeacherId(string $teacherId): array;
}
