<?php

namespace App\Repositories;

use App\Models\StudentProfile;
use App\Repositories\Contracts\StudentProfileRepositoryInterface;

class StudentProfileRepository implements StudentProfileRepositoryInterface
{
    protected $model;

    public function __construct(StudentProfile $model)
    {
        $this->model = $model;
    }

    public function all()
    {
        return $this->model->with(['user', 'department'])->get();
    }

    public function find($id)
    {
        return $this->model->with(['user', 'department'])->find($id);
    }

    public function create(array $data)
    {
        return $this->model->create($data);
    }

    public function update($id, array $data)
    {
        $profile = $this->model->find($id);
        if ($profile) {
            $profile->update($data);
            return $profile;
        }
        return null;
    }

    public function delete($id)
    {
        $profile = $this->model->find($id);
        if ($profile) {
            return $profile->delete();
        }
        return false;
    }
}
