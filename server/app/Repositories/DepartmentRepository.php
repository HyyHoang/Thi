<?php

namespace App\Repositories;

use App\Models\Department;
use App\Repositories\Contracts\DepartmentRepositoryInterface;
use Illuminate\Support\Collection;

class DepartmentRepository extends BaseRepository implements DepartmentRepositoryInterface
{
    public function __construct(Department $model)
    {
        parent::__construct($model);
    }

    /**
     * {@inheritDoc}
     */
    public function getAll(): Collection
    {
        return $this->model->newQuery()
            ->orderBy('DepartmentID')
            ->get();
    }

    /**
     * {@inheritDoc}
     */
    public function getAllOrdered(): Collection
    {
        return $this->getAll();
    }

    /**
     * {@inheritDoc}
     */
    public function existsByName(string $name, ?int $excludeId = null): bool
    {
        return $this->model->newQuery()
            ->where('DepartmentName', $name)
            ->when($excludeId !== null, fn ($q) => $q->where('DepartmentID', '!=', $excludeId))
            ->exists();
    }
}
