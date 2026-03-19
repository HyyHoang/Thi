<?php

namespace App\Repositories;

use App\Models\Institute;
use App\Repositories\Contracts\InstituteRepositoryInterface;
use Illuminate\Support\Collection;

class InstituteRepository extends BaseRepository implements InstituteRepositoryInterface
{
    public function __construct(Institute $model)
    {
        parent::__construct($model);
    }

    /**
     * {@inheritDoc}
     */
    public function getAll(): Collection
    {
        return $this->model->newQuery()
            ->orderBy('InstituteID')
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
            ->where('InstituteName', $name)
            ->when($excludeId !== null, fn ($q) => $q->where('InstituteID', '!=', $excludeId))
            ->exists();
    }
}
