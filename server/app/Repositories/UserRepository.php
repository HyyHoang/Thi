<?php

namespace App\Repositories;

use App\Models\User;
use App\Repositories\Contracts\UserRepositoryInterface;
use Illuminate\Support\Collection;

class UserRepository extends BaseRepository implements UserRepositoryInterface
{
    public function __construct(User $model)
    {
        parent::__construct($model);
    }

    /**
     * {@inheritDoc}
     */
    public function getAll(): Collection
    {
        return $this->model->newQuery()
            ->orderByDesc('UserID')
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
    public function existsByUsername(string $username, ?int $excludeId = null): bool
    {
        return $this->model->newQuery()
            ->where('Username', $username)
            ->when($excludeId !== null, fn ($q) => $q->where('UserID', '!=', $excludeId))
            ->exists();
    }

    /**
     * {@inheritDoc}
     */
    public function existsByEmail(string $email, ?int $excludeId = null): bool
    {
        return $this->model->newQuery()
            ->where('Email', $email)
            ->when($excludeId !== null, fn ($q) => $q->where('UserID', '!=', $excludeId))
            ->exists();
    }
}
