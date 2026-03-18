<?php

namespace App\Services;

use App\Models\Institute;
use App\Repositories\Contracts\DepartmentRepositoryInterface;
use App\Services\Contracts\DepartmentServiceInterface;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;

class DepartmentService extends BaseService implements DepartmentServiceInterface
{
    public function __construct(DepartmentRepositoryInterface $repository)
    {
        parent::__construct($repository);
    }

    /**
     * {@inheritDoc}
     *
     * Lấy danh sách khoa kèm thông tin viện.
     */
    public function getAllWithInstitute(): array
    {
        $departments = $this->repository->getAll();

        // Load institutes một lần để tránh N+1
        $instituteIds = $departments->pluck('InstituteID')->filter()->unique()->values();
        $institutesById = Institute::query()
            ->whereIn('InstituteID', $instituteIds)
            ->get()
            ->keyBy('InstituteID');

        return $departments->map(function ($department) use ($institutesById) {
            $institute = $department->InstituteID
                ? $institutesById->get($department->InstituteID)
                : null;

            return $this->formatDepartment($department, $institute);
        })->all();
    }

    /**
     * {@inheritDoc}
     *
     * Lấy chi tiết khoa kèm thông tin viện.
     */
    public function getByIdWithInstitute(int $id): array
    {
        $department = $this->repository->findById($id);
        $institute = $department->InstituteID
            ? Institute::where('InstituteID', $department->InstituteID)->first()
            : null;

        return $this->formatDepartment($department, $institute);
    }

    /**
     * {@inheritDoc}
     *
     * Override create để trả về formatted array kèm Institute.
     */
    public function create(array $data): array
    {
        $department = $this->repository->create([
            'DepartmentName' => $data['department_name'],
            'InstituteID'    => $data['institute_id'],
            'Description'    => $data['description'] ?? null,
        ]);

        $institute = $department->InstituteID
            ? Institute::where('InstituteID', $department->InstituteID)->first()
            : null;

        return $this->formatDepartment($department, $institute);
    }

    /**
     * {@inheritDoc}
     *
     * Override update để trả về formatted array kèm Institute.
     */
    public function update(int $id, array $data): array
    {
        $department = $this->repository->update($id, [
            'DepartmentName' => $data['department_name'],
            'InstituteID'    => $data['institute_id'],
            'Description'    => $data['description'] ?? null,
        ]);

        $institute = $department->InstituteID
            ? Institute::where('InstituteID', $department->InstituteID)->first()
            : null;

        return $this->formatDepartment($department, $institute);
    }

    /**
     * {@inheritDoc}
     *
     * Override delete để handle FK constraint.
     *
     * @throws \RuntimeException nếu có dữ liệu liên quan
     */
    public function delete(int $id): bool
    {
        try {
            return $this->repository->delete($id);
        } catch (QueryException $e) {
            // SQLSTATE 23000 = Integrity constraint violation (FK)
            if (($e->errorInfo[0] ?? null) === '23000') {
                throw new \RuntimeException('Không thể xóa khoa vì đang có dữ liệu liên quan.');
            }

            throw $e;
        }
    }

    // -------------------------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------------------------

    /**
     * Format department thành array response chuẩn.
     *
     * @param  \App\Models\Department           $department
     * @param  \App\Models\Institute|null       $institute
     * @return array<string, mixed>
     */
    private function formatDepartment($department, $institute): array
    {
        return [
            'department_id'   => $department->DepartmentID,
            'department_name' => $department->DepartmentName,
            'institute_id'    => $department->InstituteID,
            'institute_name'  => $institute?->InstituteName,
            'description'     => $department->Description,
        ];
    }
}
