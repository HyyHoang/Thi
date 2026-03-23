<?php

namespace App\Services\Contracts;

interface SubjectServiceInterface
{
    public function getAllSubjects();
    public function getSubjectById($id);
    public function createSubject(array $data);
    public function updateSubject($id, array $data);
    public function deleteSubject($id);
}
