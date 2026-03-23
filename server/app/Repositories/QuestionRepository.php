<?php

namespace App\Repositories;

use App\Models\Question;
use App\Repositories\Contracts\QuestionRepositoryInterface;
use Illuminate\Support\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class QuestionRepository extends BaseRepository implements QuestionRepositoryInterface
{
    public function __construct(Question $model)
    {
        parent::__construct($model);
    }

    public function getAllWithOptions(): Collection
    {
        return $this->model->newQuery()
            ->with('options')
            ->orderBy('QuestionID', 'desc')
            ->get();
    }

    public function getPaginatedWithOptions(int $perPage = 15, string $search = '', ?string $type = null): LengthAwarePaginator
    {
        return $this->model->newQuery()
            ->with(['options'])
            ->when($search, function ($query, $search) {
                return $query->where('Content', 'LIKE', "%{$search}%");
            })
            ->when($type, function ($query, $type) {
                return $query->where('Type', $type);
            })
            ->orderBy('QuestionID', 'desc')
            ->paginate($perPage);
    }

    public function getByUserId(string $userId): Collection
    {
        return $this->model->newQuery()
            ->where('UserID', $userId)
            ->with('options')
            ->orderBy('QuestionID', 'desc')
            ->get();
    }

    public function findWithOptions(string $id)
    {
        return $this->model->newQuery()
            ->with('options')
            ->find($id);
    }
}
