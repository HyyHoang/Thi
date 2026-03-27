<?php

namespace App\Repositories;

use App\Models\CourseSection;
use App\Repositories\Contracts\CourseSectionRepositoryInterface;
use Illuminate\Support\Collection;

class CourseSectionRepository extends BaseRepository implements CourseSectionRepositoryInterface
{
    public function __construct(CourseSection $model)
    {
        parent::__construct($model);
    }

    public function getAll(): Collection
    {
        return $this->model->newQuery()
            ->orderBy('SectionID', 'desc')
            ->get();
    }

    public function existsByName(string $name, string|int|null $excludeId = null): bool
    {
        return $this->model->newQuery()
            ->where('SectionName', $name)
            ->when($excludeId !== null, fn ($q) => $q->where('SectionID', '!=', $excludeId))
            ->exists();
    }
}
