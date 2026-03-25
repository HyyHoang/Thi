<?php

namespace App\Services;

use App\Repositories\Contracts\SemesterRepositoryInterface;
use App\Services\Contracts\SemesterServiceInterface;
use Illuminate\Database\QueryException;

class SemesterService extends BaseService implements SemesterServiceInterface
{
    public function __construct(SemesterRepositoryInterface $repository)
    {
        parent::__construct($repository);
    }

    /**
     * {@inheritDoc}
     */
    public function getAllFormatted(): array
    {
        $semesters = $this->repository->getAll();

        return $semesters->map(fn ($semester) => $this->formatSemester($semester))->all();
    }

    /**
     * {@inheritDoc}
     */
    public function getByIdFormatted(string|int $id): array
    {
        $semester = $this->repository->findById($id);

        return $this->formatSemester($semester);
    }

    /**
     * {@inheritDoc}
     */
    public function create(array $data): array
    {
        $semester = $this->repository->create([
            'SemesterName' => $data['semester_name'],
            'AcademicYear' => $data['academic_year'],
            'StartDate' => $data['start_date'],
            'EndDate' => $data['end_date'],
        ]);

        return $this->formatSemester($semester);
    }

    /**
     * {@inheritDoc}
     */
    public function update(string|int $id, array $data): array
    {
        $semester = $this->repository->update($id, [
            'SemesterName' => $data['semester_name'],
            'AcademicYear' => $data['academic_year'],
            'StartDate' => $data['start_date'],
            'EndDate' => $data['end_date'],
        ]);

        return $this->formatSemester($semester);
    }

    /**
     * {@inheritDoc}
     *
     * @throws \RuntimeException nếu học kỳ đang được tham chiếu dữ liệu khác
     */
    public function delete(string|int $id): bool
    {
        try {
            return $this->repository->delete($id);
        } catch (QueryException $e) {
            if (($e->errorInfo[0] ?? null) === '23000' && ($e->errorInfo[1] ?? null) === 1451) {
                throw new \RuntimeException('Không thể xóa học kỳ đang được sử dụng.');
            }

            throw $e;
        }
    }

    /**
     * @return array<string, mixed>
     */
    private function formatSemester($semester): array
    {
        return [
            'semester_id' => $semester->SemesterID,
            'semester_name' => $semester->SemesterName,
            'academic_year' => $semester->AcademicYear,
            'start_date' => $semester->StartDate,
            'end_date' => $semester->EndDate,
        ];
    }
}
