<?php

namespace App\Repositories;

use App\Models\Semester;
use App\Repositories\Contracts\SemesterRepositoryInterface;
use Illuminate\Support\Collection;

class SemesterRepository extends BaseRepository implements SemesterRepositoryInterface
{
    public function __construct(Semester $model)
    {
        parent::__construct($model);
    }

    /**
     * {@inheritDoc}
     */
    public function getAll(): Collection
    {
        return $this->model->newQuery()
            ->orderBy('StartDate', 'desc')
            ->orderBy('SemesterID', 'desc')
            ->get();
    }

    /**
     * {@inheritDoc}
     */
    public function getAllOrdered(): Collection
    {
        return $this->getAll();
    }
}
