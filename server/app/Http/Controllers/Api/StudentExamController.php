<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Enrollment;
use App\Models\Exam;
use App\Models\ExamAttempt;
use App\Models\Semester;
use App\Models\StudentProfile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StudentExamController extends Controller
{
    /**
     * GET /api/student/exams
     * Lấy danh sách bài thi của sinh viên đang đăng nhập.
     * Logic: UserID → StudentProfile → Enrollment → CourseSection (kỳ hiện tại) → Exam
     */
    public function myExams(Request $request): JsonResponse
    {
        $user = $request->user();

        // Tìm StudentProfile
        $student = StudentProfile::where('UserID', $user->UserID)->first();
        if (!$student) {
            return response()->json([
                'success' => true,
                'data'    => [],
                'message' => 'Không tìm thấy hồ sơ sinh viên.',
            ]);
        }

        // Tìm kỳ học hiện tại
        $today = now()->toDateString();
        $currentSemester = Semester::where('StartDate', '<=', $today)
            ->where('EndDate', '>=', $today)
            ->first();

        if (!$currentSemester) {
            return response()->json([
                'success' => true,
                'data'    => [],
                'message' => 'Không có kỳ học nào đang diễn ra.',
            ]);
        }

        // Lấy các lớp HP mà sinh viên đã đăng ký trong kỳ hiện tại
        $enrollments = Enrollment::where('StudentID', $student->StudentID)
            ->where('Status', 1) // Chỉ lấy đăng ký đang hoạt động
            ->whereHas('courseSection', function ($q) use ($currentSemester) {
                $q->where('SemesterID', $currentSemester->SemesterID);
            })
            ->with(['courseSection.subject', 'courseSection.semester', 'courseSection.teacher'])
            ->get();

        $sectionIds = $enrollments->pluck('SectionID')->unique()->values();

        if ($sectionIds->isEmpty()) {
            return response()->json([
                'success' => true,
                'data'    => [],
                'message' => 'Bạn chưa đăng ký lớp học phần nào trong kỳ hiện tại.',
            ]);
        }

        // Lấy các bài thi thuộc các lớp HP
        $exams = Exam::whereIn('SectionID', $sectionIds)
            ->with(['courseSection.subject', 'courseSection.semester'])
            ->orderBy('StartTime', 'asc')
            ->get();

        // Lấy tất cả attempt của sinh viên cho các bài thi này
        $examIds = $exams->pluck('ExamID');
        $attempts = ExamAttempt::where('StudentID', $student->StudentID)
            ->whereIn('ExamID', $examIds)
            ->get()
            ->keyBy('ExamID');

        $now = now();

        $examList = $exams->map(function (Exam $exam) use ($now, $attempts) {
            $section  = $exam->courseSection;
            $subject  = $section?->subject;
            $semester = $section?->semester;

            // Xác định trạng thái
            $attempt = $attempts->get($exam->ExamID);
            $startTime = $exam->StartTime;
            $endTime   = $exam->EndTime;

            if ($attempt && in_array($attempt->Status, ['submitted', 'expired'])) {
                $status = 'completed';
            } elseif ($now->lt($startTime)) {
                $status = 'upcoming';
            } elseif ($now->gt($endTime)) {
                $status = 'expired';
            } else {
                $status = 'active';
            }

            $result = [
                'exam_id'          => $exam->ExamID,
                'title'            => $exam->Title,
                'section_id'       => $exam->SectionID,
                'section_name'     => $section?->SectionName,
                'subject_name'     => $subject?->SubjectName,
                'semester_name'    => $semester?->SemesterName,
                'duration'         => (int) $exam->Duration,
                'question_count'   => (int) $exam->QuestionCount,
                'password_enabled' => !is_null($exam->PasswordExam),
                'is_fullscreen'    => (bool) $exam->IsFullscreen,
                'is_prevent_copy'  => (bool) $exam->IsPreventCopy,
                'start_time'       => $startTime?->format('Y-m-d H:i:s'),
                'end_time'         => $endTime?->format('Y-m-d H:i:s'),
                'status'           => $status,
                'attempt'          => null,
            ];

            if ($attempt) {
                $result['attempt'] = [
                    'attempt_id' => $attempt->AttemptID,
                    'status'     => $attempt->Status,
                    'start_time' => $attempt->StartTime?->format('Y-m-d H:i:s'),
                    'submit_time'=> $attempt->SubmitTime?->format('Y-m-d H:i:s'),
                ];

                // Lấy điểm nếu đã hoàn thành
                if ($attempt->Status === 'submitted') {
                    $resultModel = \App\Models\Result::where('AttemptID', $attempt->AttemptID)->first();
                    if ($resultModel) {
                        $result['attempt']['score']           = (float) $resultModel->Score;
                        $result['attempt']['correct_answers'] = (int) $resultModel->CorrectAnswers;
                        $result['attempt']['working_time']    = (int) $resultModel->WorkingTime;
                    }
                }
            }

            return $result;
        })->all();

        return response()->json([
            'success'  => true,
            'data'     => $examList,
            'semester' => [
                'semester_id'   => $currentSemester->SemesterID,
                'semester_name' => $currentSemester->SemesterName,
                'academic_year' => $currentSemester->AcademicYear,
            ],
        ]);
    }

    /**
     * GET /api/student/profile
     * Lấy thông tin sinh viên hiện tại
     */
    public function myProfile(Request $request): JsonResponse
    {
        $user = $request->user();
        $student = StudentProfile::where('UserID', $user->UserID)
            ->with(['department', 'user'])
            ->first();

        if (!$student) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy hồ sơ sinh viên.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data'    => [
                'student_id'      => $student->StudentID,
                'full_name'       => $student->FullName,
                'enrollment_year' => $student->EnrollmentYear,
                'status'          => $student->Status,
                'date_of_birth'   => $student->DateOfBirth,
                'gender'          => $student->Gender,
                'hometown'        => $student->Hometown,
                'department'      => $student->department ? [
                    'department_id'   => $student->department->DepartmentID,
                    'department_name' => $student->department->DepartmentName,
                ] : null,
            ],
        ]);
    }
}
