<?php

namespace App\Services;

use App\Models\CourseSection;
use App\Models\StudentProfile;
use App\Models\Enrollment;
use App\Services\Contracts\EnrollmentServiceInterface;
use App\Repositories\Contracts\EnrollmentRepositoryInterface;
use Illuminate\Support\Facades\DB;

class EnrollmentService extends BaseService implements EnrollmentServiceInterface
{
    public function __construct(
        private readonly EnrollmentRepositoryInterface $enrollmentRepository
    ) {
        parent::__construct($enrollmentRepository);
    }

    public function getAllWithRelations(): array
    {
        $enrollments = $this->enrollmentRepository->getModel()
            ->with(['courseSection.subject', 'courseSection.semester', 'courseSection.teacher', 'studentProfile.department'])
            ->get();
            
        return $enrollments->map(function(Enrollment $e) {
            return $this->formatEnrollment($e);
        })->toArray();
    }

    public function getByIdWithRelations(string $id): array
    {
        /** @var Enrollment $enrollment */
        $enrollment = $this->enrollmentRepository->getModel()
            ->with(['courseSection.subject', 'courseSection.semester', 'courseSection.teacher', 'studentProfile.department'])
            ->findOrFail($id);
            
        return $this->formatEnrollment($enrollment);
    }

    public function getByStudentId(string $studentId): array
    {
        $enrollments = $this->enrollmentRepository->getModel()->where('StudentID', $studentId)
            ->with(['courseSection.subject', 'courseSection.semester', 'courseSection.teacher', 'studentProfile.department'])
            ->get();
            
        return $enrollments->map(function(Enrollment $e) {
            return $this->formatEnrollment($e);
        })->toArray();
    }

    public function getByTeacherId(string $teacherId): array
    {
        $enrollments = $this->enrollmentRepository->getModel()->whereHas('courseSection', function ($query) use ($teacherId) {
                $query->where('TeacherID', $teacherId);
            })
            ->with(['courseSection.subject', 'courseSection.semester', 'courseSection.teacher', 'studentProfile.department'])
            ->get();
            
        return $enrollments->map(function(Enrollment $e) {
            return $this->formatEnrollment($e);
        })->toArray();
    }

    private function formatEnrollment(Enrollment $enrollment): array
    {
        return [
            'EnrollmentID'   => $enrollment->EnrollmentID,
            'SectionID'      => $enrollment->SectionID,
            'StudentID'      => $enrollment->StudentID,
            'EnrollDate'     => $enrollment->EnrollDate,
            'Status'         => $enrollment->Status,
            'course_section' => $enrollment->courseSection ? [
                'SectionID'   => $enrollment->courseSection->SectionID,
                'SectionName' => $enrollment->courseSection->SectionName,
                'MaxStudent'  => $enrollment->courseSection->MaxStudent,
                'Subject'     => $enrollment->courseSection->subject ? [
                    'SubjectID'   => $enrollment->courseSection->subject->SubjectID,
                    'SubjectName' => $enrollment->courseSection->subject->SubjectName,
                ] : null,
                'Semester'    => $enrollment->courseSection->semester ? [
                    'SemesterID'   => $enrollment->courseSection->semester->SemesterID,
                    'SemesterName' => $enrollment->courseSection->semester->SemesterName,
                ] : null,
                'Teacher'     => $enrollment->courseSection->teacher ? [
                    'TeacherID' => $enrollment->courseSection->teacher->TeacherID,
                    'FullName'  => $enrollment->courseSection->teacher->FullName,
                ] : null,
            ] : null,
            'student_profile' => $enrollment->studentProfile ? [
                'StudentID'      => $enrollment->studentProfile->StudentID,
                'FullName'       => $enrollment->studentProfile->FullName,
                'EnrollmentYear' => $enrollment->studentProfile->EnrollmentYear,
                'Status'         => $enrollment->studentProfile->Status,
                'Department'     => $enrollment->studentProfile->department ? [
                    'DepartmentID'   => $enrollment->studentProfile->department->DepartmentID,
                    'DepartmentName' => $enrollment->studentProfile->department->DepartmentName,
                ] : null,
            ] : null,
        ];
    }

    /**
     * Override create to include validation logic for Enrollment
     */
    public function create(array $data): mixed
    {
        return DB::transaction(function () use ($data) {
            $studentId = $data['StudentID'];
            $sectionId = $data['SectionID'];

            // 1. Kiểm tra trùng đăng ký
            $exists = Enrollment::where('StudentID', $studentId)
                ->where('SectionID', $sectionId)
                ->exists();
            if ($exists) {
                throw new \RuntimeException('Sinh viên đã đăng ký lớp học phần này rồi.');
            }

            // 2. Kiểm tra sĩ số
            $section = CourseSection::where('SectionID', $sectionId)->firstOrFail();
            $currentEnrollments = Enrollment::where('SectionID', $sectionId)->where('Status', 1)->count();
            if ($currentEnrollments >= $section->MaxStudent) {
                throw new \RuntimeException('Lớp học phần đã đủ sĩ số.');
            }

            // 3. Kiểm tra trạng thái sinh viên
            $student = StudentProfile::where('StudentID', $studentId)->firstOrFail();
            if ($student->Status != 1) {
                throw new \RuntimeException('Sinh viên không ở trạng thái đang học, không thể đăng ký.');
            }

            return parent::create($data);
        });
    }
}
