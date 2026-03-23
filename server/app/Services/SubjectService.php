<?php

namespace App\Services;

use App\Repositories\Contracts\SubjectRepositoryInterface;
use App\Services\Contracts\SubjectServiceInterface;
use Illuminate\Database\QueryException;

class SubjectService implements SubjectServiceInterface
{
    protected $subjectRepository;

    public function __construct(SubjectRepositoryInterface $subjectRepository)
    {
        $this->subjectRepository = $subjectRepository;
    }

    public function getAllSubjects()
    {
        return $this->subjectRepository->getAll();
    }

    public function getSubjectById($id)
    {
        return $this->subjectRepository->getById($id);
    }

    public function createSubject(array $data)
    {
        return $this->subjectRepository->create($data);
    }

    public function updateSubject($id, array $data)
    {
        return $this->subjectRepository->update($id, $data);
    }

    public function deleteSubject($id)
    {
        try {
            return $this->subjectRepository->delete($id);
        } catch (QueryException $e) {
            if (($e->errorInfo[0] ?? null) === '23000' && ($e->errorInfo[1] ?? null) === 1451) {
                throw new \RuntimeException('Hiện đang có dữ liệu đang sử dụng môn học này, không thể xóa.');
            }

            throw $e;
        }
    }
}
