<?php

namespace App\Repositories;

use App\Models\TeacherProfile;
use App\Repositories\Contracts\TeacherProfileRepositoryInterface;
use Illuminate\Support\Collection;

class TeacherProfileRepository extends BaseRepository implements TeacherProfileRepositoryInterface
{
    public function __construct(TeacherProfile $model)
    {
        parent::__construct($model);
    }

    public function getAllWithRelations(): Collection
    {
        return $this->model->newQuery()
            ->with(['user', 'department'])
            ->orderBy('TeacherID', 'desc')
            ->get();
    }

    public function findByUserId(int $userId): ?TeacherProfile
    {
        return $this->model->newQuery()
            ->with(['user', 'department'])
            ->where('UserID', $userId)
            ->first();
    }
    
    public function findByIdWithRelations(int $id): ?TeacherProfile
    {
        return $this->model->newQuery()
            ->with(['user', 'department'])
            ->find($id);
    }
}
