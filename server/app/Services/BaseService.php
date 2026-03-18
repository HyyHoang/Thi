<?php

namespace App\Services;

use App\Repositories\Contracts\RepositoryInterface;
use App\Services\Contracts\ServiceInterface;

abstract class BaseService implements ServiceInterface
{
    /**
     * Repository được inject từ lớp con.
     */
    protected RepositoryInterface $repository;

    public function __construct(RepositoryInterface $repository)
    {
        $this->repository = $repository;
    }

    /**
     * {@inheritDoc}
     */
    public function getAll(): mixed
    {
        return $this->repository->getAll();
    }

    /**
     * {@inheritDoc}
     */
    public function getById(int $id): mixed
    {
        return $this->repository->findById($id);
    }

    /**
     * {@inheritDoc}
     */
    public function create(array $data): mixed
    {
        return $this->repository->create($data);
    }

    /**
     * {@inheritDoc}
     */
    public function update(int $id, array $data): mixed
    {
        return $this->repository->update($id, $data);
    }

    /**
     * {@inheritDoc}
     */
    public function delete(int $id): bool
    {
        return $this->repository->delete($id);
    }
}
