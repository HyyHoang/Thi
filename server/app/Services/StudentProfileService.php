<?php

namespace App\Services;

use App\Repositories\Contracts\StudentProfileRepositoryInterface;
use App\Services\Contracts\StudentProfileServiceInterface;
use Exception;

class StudentProfileService implements StudentProfileServiceInterface
{
    protected $repository;

    public function __construct(StudentProfileRepositoryInterface $repository)
    {
        $this->repository = $repository;
    }

    public function getAllStudentProfiles()
    {
        return $this->repository->all();
    }

    public function getStudentProfileById($id)
    {
        return $this->repository->find($id);
    }

    public function createStudentProfile(array $data)
    {
        return $this->repository->create($data);
    }

    public function updateStudentProfile($id, array $data)
    {
        return $this->repository->update($id, $data);
    }

    public function deleteStudentProfile($id)
    {
        return $this->repository->delete($id);
    }
}
