<?php

namespace App\Services\Contracts;

interface StudentProfileServiceInterface
{
    public function getAllStudentProfiles();
    public function getStudentProfileById($id);
    public function createStudentProfile(array $data);
    public function updateStudentProfile($id, array $data);
    public function deleteStudentProfile($id);
}
