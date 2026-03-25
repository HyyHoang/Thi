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

    public function getPaginatedWithOptions(int $perPage = 15, string $search = '', ?string $type = null, array $filters = []): LengthAwarePaginator
    {
        return $this->model->newQuery()
            ->with(['options'])
            ->when($search, function ($query, $search) {
                return $query->where('Content', 'LIKE', "%{$search}%");
            })
            ->when($type, function ($query, $type) {
                return $query->where('Type', $type);
            })
            ->when(isset($filters['bank_id']), function ($query) use ($filters) {
                return $query->where('BankID', $filters['bank_id']);
            })
            ->when(isset($filters['chapter_number']), function ($query) use ($filters) {
                return $query->where('ChapterNumber', $filters['chapter_number']);
            })
            ->when(isset($filters['subject_id']), function ($query) use ($filters) {
                return $query->where('SubjectID', $filters['subject_id']);
            })
            ->when(isset($filters['exclude_bank_id']), function ($query) use ($filters) {
                return $query->where(function ($q) use ($filters) {
                    $q->whereNull('BankID')
                      ->orWhere('BankID', '!=', $filters['exclude_bank_id']);
                });
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
