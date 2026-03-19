<?php

namespace App\Services;

use App\Repositories\Contracts\TeacherProfileRepositoryInterface;
use App\Services\Contracts\TeacherProfileServiceInterface;
use Illuminate\Database\QueryException;

class TeacherProfileService extends BaseService implements TeacherProfileServiceInterface
{
    public function __construct(TeacherProfileRepositoryInterface $repository)
    {
        parent::__construct($repository);
    }

    public function getAllFormatted(): array
    {
        return $this->repository->getAllWithRelations()
            ->map(fn ($profile) => $this->formatProfile($profile))
            ->all();
    }

    public function getByIdFormatted(int $id): array
    {
        $profile = $this->repository->findByIdWithRelations($id);
        if (!$profile) {
            throw new \RuntimeException('Không tìm thấy hồ sơ giảng viên.');
        }

        return $this->formatProfile($profile);
    }

    public function getByUserIdFormatted(int $userId): array
    {
        $profile = $this->repository->findByUserId($userId);
        if (!$profile) {
            throw new \RuntimeException('Không tìm thấy hồ sơ cá nhân.');
        }

        return $this->formatProfile($profile);
    }

    public function create(array $data): array
    {
        // Check if UserID already has a profile
        if ($this->repository->findByUserId($data['user_id'])) {
            throw new \InvalidArgumentException('Giảng viên này đã có hồ sơ.');
        }

        $profile = $this->repository->create([
            'UserID'       => $data['user_id'],
            'DepartmentID' => $data['department_id'],
            'FullName'     => $data['full_name'],
            'Gender'       => $data['gender'] ?? null,
            'BirthDate'    => $data['birth_date'] ?? null,
            'Phone'        => $data['phone'] ?? null,
            'Degree'       => $data['degree'] ?? null,
            'AcademicRank' => $data['academic_rank'] ?? null,
            'CreatedDate'  => now(),
        ]);

        return $this->formatProfile($this->repository->findByIdWithRelations($profile->TeacherID));
    }

    public function update(int $id, array $data): array
    {
        $this->repository->update($id, [
            'DepartmentID' => $data['department_id'],
            'FullName'     => $data['full_name'],
            'Gender'       => $data['gender'] ?? null,
            'BirthDate'    => $data['birth_date'] ?? null,
            'Phone'        => $data['phone'] ?? null,
            'Degree'       => $data['degree'] ?? null,
            'AcademicRank' => $data['academic_rank'] ?? null,
        ]);

        return $this->formatProfile($this->repository->findByIdWithRelations($id));
    }

    public function updateMyProfile(int $userId, array $data): array
    {
        $profile = $this->repository->findByUserId($userId);
        if (!$profile) {
            throw new \RuntimeException('Không tìm thấy hồ sơ cá nhân.');
        }

        // Only allow updating specific fields
        // Update User avatar if provided
        if (isset($data['avt'])) {
            $profile->user()->update(['AVT' => $data['avt']]);
        }

        // Only allow updating specific fields
        $this->repository->update($profile->TeacherID, [
            'Gender'    => $data['gender'] ?? null,
            'BirthDate' => $data['birth_date'] ?? null,
            'Phone'     => $data['phone'] ?? null,
        ]);

        return $this->formatProfile($this->repository->findByIdWithRelations($profile->TeacherID));
    }

    public function delete(int $id): bool
    {
        try {
            return $this->repository->delete($id);
        } catch (QueryException $e) {
            throw new \RuntimeException('Không thể xóa hồ sơ.');
        }
    }

    private function formatProfile($profile): array
    {
        return [
            'teacher_id'    => $profile->TeacherID,
            'user_id'       => $profile->UserID,
            'department_id' => $profile->DepartmentID,
            'full_name'     => $profile->FullName,
            'gender'        => $profile->Gender,
            'birth_date'    => $profile->BirthDate,
            'phone'         => $profile->Phone,
            'degree'        => $profile->Degree,
            'academic_rank' => $profile->AcademicRank,
            'created_date'  => $profile->CreatedDate,
            'department'    => $profile->department ? [
                'department_id'   => $profile->department->DepartmentID,
                'department_name' => $profile->department->DepartmentName,
            ] : null,
            'user' => $profile->user ? [
                'id'    => $profile->user->UserID,
                'name'  => $profile->user->Username,
                'email' => $profile->user->Email,
                'avt'   => $profile->user->AVT,
            ] : null,
        ];
    }
}
