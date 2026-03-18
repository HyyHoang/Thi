<?php

namespace App\Repositories;

use App\Repositories\Contracts\RepositoryInterface;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;

abstract class BaseRepository implements RepositoryInterface
{
    /**
     * Eloquent model instance được inject từ lớp con.
     */
    protected Model $model;

    public function __construct(Model $model)
    {
        $this->model = $model;
    }

    /**
     * {@inheritDoc}
     */
    public function getAll(): Collection
    {
        return $this->model->newQuery()->get();
    }

    /**
     * {@inheritDoc}
     */
    public function findById(int $id): Model
    {
        // firstOrFail() ném ModelNotFoundException → Laravel tự convert 404
        return $this->model->newQuery()
            ->where($this->model->getKeyName(), $id)
            ->firstOrFail();
    }

    /**
     * {@inheritDoc}
     */
    public function create(array $data): Model
    {
        return $this->model->newQuery()->create($data);
    }

    /**
     * {@inheritDoc}
     */
    public function update(int $id, array $data): Model
    {
        $record = $this->findById($id);
        $record->fill($data)->save();

        return $record->fresh();
    }

    /**
     * {@inheritDoc}
     */
    public function delete(int $id): bool
    {
        $record = $this->findById($id);

        return (bool) $record->delete();
    }
}
