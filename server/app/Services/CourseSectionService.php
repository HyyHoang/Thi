<?php

namespace App\Services;

use App\Models\Subject;
use App\Models\Semester;
use App\Models\TeacherProfile;
use App\Repositories\Contracts\CourseSectionRepositoryInterface;
use App\Services\Contracts\CourseSectionServiceInterface;
use Illuminate\Database\QueryException;

class CourseSectionService extends BaseService implements CourseSectionServiceInterface
{
    public function __construct(CourseSectionRepositoryInterface $repository)
    {
        parent::__construct($repository);
    }

    public function getAllWithRelations(): array
    {
        $sections = $this->repository->getAll();

        // Eager load related manually similarly to DepartmentService or use Eloquent with()
        $sections->load(['subject', 'semester', 'teacher']);

        return $sections->map(function ($section) {
            return $this->formatSection($section);
        })->all();
    }

    public function getByIdWithRelations(string|int $id): array
    {
        $section = $this->repository->findById($id);
        $section->load(['subject', 'semester', 'teacher']);

        return $this->formatSection($section);
    }

    public function create(array $data): array
    {
        $section = $this->repository->create([
            'SectionName' => $data['SectionName'],
            'SubjectID'   => $data['SubjectID'],
            'SemesterID'  => $data['SemesterID'],
            'TeacherID'   => $data['TeacherID'],
            'MaxStudent'  => $data['MaxStudent'],
        ]);

        $section->load(['subject', 'semester', 'teacher']);
        return $this->formatSection($section);
    }

    public function update(string|int $id, array $data): array
    {
        $section = $this->repository->update($id, [
            'SectionName' => $data['SectionName'],
            'SubjectID'   => $data['SubjectID'],
            'SemesterID'  => $data['SemesterID'],
            'TeacherID'   => $data['TeacherID'],
            'MaxStudent'  => $data['MaxStudent'],
        ]);

        $section->load(['subject', 'semester', 'teacher']);
        return $this->formatSection($section);
    }

    public function delete(string|int $id): bool
    {
        try {
            return $this->repository->delete($id);
        } catch (QueryException $e) {
            if (($e->errorInfo[0] ?? null) === '23000' && ($e->errorInfo[1] ?? null) === 1451) {
                throw new \RuntimeException('Không thể xóa lớp học phần đã có sinh viên hoặc dữ liệu liên quan.');
            }
            throw $e;
        }
    }

    private function formatSection($section): array
    {
        return [
            'SectionID'    => $section->SectionID,
            'SectionName'  => $section->SectionName,
            'Subject'      => $section->subject ? [
                'SubjectID'   => $section->subject->SubjectID,
                'SubjectName' => $section->subject->SubjectName,
            ] : null,
            'Semester'     => $section->semester ? [
                'SemesterID'   => $section->semester->SemesterID,
                'SemesterName' => $section->semester->SemesterName,
            ] : null,
            'Teacher'      => $section->teacher ? [
                'TeacherID' => $section->teacher->TeacherID,
                'FullName'  => $section->teacher->FullName,
            ] : null,
            'MaxStudent'   => $section->MaxStudent,
            'CreatedDate'  => $section->CreatedDate,
            // To ensure compatibility format depending on frontend fields.
            'SubjectID'    => $section->SubjectID,
            'SemesterID'   => $section->SemesterID,
            'TeacherID'    => $section->TeacherID,
        ];
    }
}
