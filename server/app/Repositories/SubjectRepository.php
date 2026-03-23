<?php

namespace App\Repositories;

use App\Models\Subject;
use App\Repositories\Contracts\SubjectRepositoryInterface;

class SubjectRepository implements SubjectRepositoryInterface
{
    public function getAll()
    {
        return Subject::with('department')->get();
    }

    public function getById($id)
    {
        return Subject::with('department')->find($id);
    }

    public function create(array $data)
    {
        return Subject::create($data);
    }

    public function update($id, array $data)
    {
        $subject = Subject::find($id);
        if ($subject) {
            $subject->update($data);
            return $subject;
        }
        return null;
    }

    public function delete($id)
    {
        $subject = Subject::find($id);
        if ($subject) {
            $subject->delete();
            return true;
        }
        return false;
    }
}
