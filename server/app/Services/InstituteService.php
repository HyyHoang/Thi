<?php

namespace App\Services;

use App\Repositories\Contracts\InstituteRepositoryInterface;
use App\Services\Contracts\InstituteServiceInterface;
use Illuminate\Database\QueryException;

class InstituteService extends BaseService implements InstituteServiceInterface
{
    public function __construct(InstituteRepositoryInterface $repository)
    {
        parent::__construct($repository);
    }

    /**
     * {@inheritDoc}
     *
     * Lấy danh sách viện đã được format.
     */
    public function getAllFormatted(): array
    {
        return $this->repository->getAll()
            ->map(fn ($institute) => $this->formatInstitute($institute))
            ->all();
    }

    /**
     * {@inheritDoc}
     *
     * Lấy chi tiết 1 viện đã được format.
     */
    public function getByIdFormatted(int $id): array
    {
        $institute = $this->repository->findById($id);

        return $this->formatInstitute($institute);
    }

    /**
     * {@inheritDoc}
     *
     * Override create để map snake_case → PascalCase và set CreatedDate.
     */
    public function create(array $data): array
    {
        $institute = $this->repository->create([
            'InstituteName' => $data['institute_name'],
            'Description'   => $data['description'] ?? null,
            'CreatedDate'   => now(),
        ]);

        return $this->formatInstitute($institute);
    }

    /**
     * {@inheritDoc}
     *
     * Override update để map fields (không đổi CreatedDate).
     */
    public function update(int $id, array $data): array
    {
        $institute = $this->repository->update($id, [
            'InstituteName' => $data['institute_name'],
            'Description'   => $data['description'] ?? null,
        ]);

        return $this->formatInstitute($institute);
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
                throw new \RuntimeException('Không thể xóa viện vì đang có dữ liệu liên quan.');
            }

            throw $e;
        }
    }

    // -------------------------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------------------------

    /**
     * Format institute thành array response chuẩn.
     *
     * @param  \App\Models\Institute  $institute
     * @return array<string, mixed>
     */
    private function formatInstitute($institute): array
    {
        return [
            'institute_id'   => $institute->InstituteID,
            'institute_name' => $institute->InstituteName,
            'description'    => $institute->Description,
            'created_date'   => $institute->CreatedDate,
        ];
    }
}
