<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CourseSection;
use App\Models\Enrollment;
use App\Models\Exam;
use App\Models\ExamAttempt;
use App\Models\Result;
use App\Models\Semester;
use App\Models\StudentProfile;
use App\Models\StudentAnswer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * GET /api/dashboard/exams
     * Lấy danh sách đề thi của kỳ hiện tại, phân quyền theo role.
     */
    public function exams(Request $request): JsonResponse
    {
        $user = $request->user();
        $semester = $this->getCurrentSemester();

        if (!$semester) {
            return response()->json([
                'success' => true,
                'data'    => [
                    'semester' => null,
                    'exams'    => [],
                ],
            ]);
        }

        // Lấy tất cả SectionID thuộc kỳ hiện tại
        $sectionIds = CourseSection::where('SemesterID', $semester->SemesterID)
            ->pluck('SectionID');

        // Lấy đề thi thuộc các lớp học phần trong kỳ
        $query = Exam::with(['courseSection.subject', 'courseSection.semester', 'creator'])
            ->whereIn('SectionID', $sectionIds);

        // Giảng viên chỉ thấy đề do mình tạo
        if ((int) $user->Role === 1) {
            $query->where('CreatedBy', $user->UserID);
        }

        $exams = $query->orderBy('StartTime', 'desc')->get();

        $now = now();
        $result = $exams->map(function (Exam $exam) use ($now) {
            $section = $exam->courseSection;
            $subject = $section?->subject;

            // Đếm số lượt thi
            $attemptCount = ExamAttempt::where('ExamID', $exam->ExamID)->count();

            // Xác định trạng thái
            $status = 'upcoming';
            if ($exam->EndTime && $exam->EndTime < $now) {
                $status = 'past';
            } elseif ($exam->StartTime && $exam->StartTime <= $now && (!$exam->EndTime || $exam->EndTime >= $now)) {
                $status = 'ongoing';
            }

            return [
                'exam_id'        => $exam->ExamID,
                'title'          => $exam->Title,
                'subject_name'   => $subject?->SubjectName ?? 'N/A',
                'section_name'   => $section?->SectionName ?? 'N/A',
                'start_time'     => $exam->StartTime?->format('Y-m-d H:i:s'),
                'end_time'       => $exam->EndTime?->format('Y-m-d H:i:s'),
                'duration'       => (int) $exam->Duration,
                'question_count' => (int) $exam->QuestionCount,
                'attempt_count'  => $attemptCount,
                'status'         => $status,
                'created_by'     => $exam->CreatedBy,
                'creator_name'   => $exam->creator?->Username,
            ];
        });

        return response()->json([
            'success' => true,
            'data'    => [
                'semester' => [
                    'semester_id'   => $semester->SemesterID,
                    'semester_name' => $semester->SemesterName,
                    'academic_year' => $semester->AcademicYear,
                ],
                'exams' => $result->values()->all(),
            ],
        ]);
    }

    /**
     * GET /api/dashboard/exam-stats
     * Lấy thống kê kết quả bài thi của kỳ hiện tại.
     */
    public function examStats(Request $request): JsonResponse
    {
        $user = $request->user();
        $semester = $this->getCurrentSemester();

        if (!$semester) {
            return response()->json([
                'success' => true,
                'data'    => [
                    'overview'           => null,
                    'score_distribution' => [],
                    'subject_pass_fail'  => [],
                ],
            ]);
        }

        // Lấy SectionID thuộc kỳ hiện tại
        $sectionIds = CourseSection::where('SemesterID', $semester->SemesterID)
            ->pluck('SectionID');

        // Lấy ExamID
        $examQuery = Exam::whereIn('SectionID', $sectionIds);
        if ((int) $user->Role === 1) {
            $examQuery->where('CreatedBy', $user->UserID);
        }
        $examIds = $examQuery->pluck('ExamID');

        // Lấy AttemptID
        $attemptIds = ExamAttempt::whereIn('ExamID', $examIds)->pluck('AttemptID');

        // Lấy tất cả Results
        $results = Result::whereIn('AttemptID', $attemptIds)->get();

        // ── 1. Tổng quan ──
        $totalExams    = $examIds->count();
        $totalAttempts = $attemptIds->count();
        $avgScore      = $results->avg('Score') ?? 0;
        $passCount     = $results->where('Score', '>=', 4)->count();
        $passRate      = $totalAttempts > 0 ? round(($passCount / $results->count()) * 100, 1) : 0;

        // ── 2. Nhóm exam theo subject ──
        $examsWithSubject = Exam::with('courseSection.subject')
            ->whereIn('ExamID', $examIds)
            ->get();

        $subjectExams = [];
        foreach ($examsWithSubject as $exam) {
            $subjectName = $exam->courseSection?->subject?->SubjectName ?? 'Không xác định';
            if (!isset($subjectExams[$subjectName])) {
                $subjectExams[$subjectName] = [];
            }
            $subjectExams[$subjectName][] = $exam->ExamID;
        }

        // ── 3. Phân bố điểm THEO TỪNG MÔN (0-1, 1-2, ..., 9-10) ──
        $scoreDistribution = [];
        foreach ($subjectExams as $subjectName => $subExamIds) {
            $subAttemptIds = ExamAttempt::whereIn('ExamID', $subExamIds)->pluck('AttemptID');
            $subResults    = Result::whereIn('AttemptID', $subAttemptIds)->get();

            $distribution = [];
            for ($i = 0; $i < 10; $i++) {
                $lower = $i;
                $upper = $i + 1;
                $label = "{$lower}-{$upper}";

                if ($i === 9) {
                    $count = $subResults->filter(fn($r) => $r->Score >= $lower && $r->Score <= $upper)->count();
                } else {
                    $count = $subResults->filter(fn($r) => $r->Score >= $lower && $r->Score < $upper)->count();
                }

                $distribution[] = [
                    'range' => $label,
                    'count' => $count,
                ];
            }

            $scoreDistribution[] = [
                'subject_name' => $subjectName,
                'distribution' => $distribution,
            ];
        }

        // ── 4. Tỷ lệ đạt/rớt theo môn ──
        $subjectPassFail = [];
        foreach ($subjectExams as $subjectName => $subExamIds) {
            $subAttemptIds = ExamAttempt::whereIn('ExamID', $subExamIds)->pluck('AttemptID');
            $subResults    = Result::whereIn('AttemptID', $subAttemptIds)->get();

            $pass = $subResults->where('Score', '>=', 4)->count();
            $fail = $subResults->where('Score', '<', 4)->count();

            $subjectPassFail[] = [
                'subject_name' => $subjectName,
                'pass'         => $pass,
                'fail'         => $fail,
                'total'        => $pass + $fail,
            ];
        }

        return response()->json([
            'success' => true,
            'data'    => [
                'overview' => [
                    'total_exams'    => $totalExams,
                    'total_attempts' => $totalAttempts,
                    'avg_score'      => round($avgScore, 2),
                    'pass_rate'      => $passRate,
                ],
                'score_distribution' => $scoreDistribution,
                'subject_pass_fail'  => $subjectPassFail,
            ],
        ]);
    }

    /**
     * GET /api/dashboard/student/exams
     * Danh sách bài thi của sinh viên trong kỳ hiện tại.
     */
    public function studentExams(Request $request): JsonResponse
    {
        $user = $request->user();
        $student = $this->resolveStudent($user);
        $semester = $this->getCurrentSemester();

        if (!$student || !$semester) {
            return response()->json([
                'success' => true,
                'data' => ['semester' => null, 'exams' => []]
            ]);
        }

        // Lấy danh sách SectionID sinh viên đăng ký trong kỳ
        $sectionIds = Enrollment::where('StudentID', $student->StudentID)
            ->where('Status', 1)
            ->whereHas('courseSection', fn($q) => $q->where('SemesterID', $semester->SemesterID))
            ->pluck('SectionID');

        $exams = Exam::with(['courseSection.subject', 'creator'])
            ->whereIn('SectionID', $sectionIds)
            ->get();

        $attempts = ExamAttempt::where('StudentID', $student->StudentID)
            ->whereIn('ExamID', $exams->pluck('ExamID'))
            ->get()
            ->keyBy('ExamID');

        $now = now();
        $result = $exams->map(function (Exam $exam) use ($now, $attempts) {
            $attempt = $attempts->get($exam->ExamID);
            
            $status = 'upcoming';
            if ($exam->EndTime && $exam->EndTime < $now) {
                $status = 'past';
            } elseif ($exam->StartTime && $exam->StartTime <= $now && (!$exam->EndTime || $exam->EndTime >= $now)) {
                $status = 'ongoing';
            }

            return [
                'exam_id'        => $exam->ExamID,
                'title'          => $exam->Title,
                'subject_name'   => $exam->courseSection?->subject?->SubjectName ?? 'N/A',
                'section_name'   => $exam->courseSection?->SectionName ?? 'N/A',
                'start_time'     => $exam->StartTime?->format('Y-m-d H:i:s'),
                'end_time'       => $exam->EndTime?->format('Y-m-d H:i:s'),
                'duration'       => (int) $exam->Duration,
                'question_count' => (int) $exam->QuestionCount,
                'status'         => $status,
                'is_done'        => $attempt && in_array($attempt->Status, ['submitted', 'expired']),
                'score'          => null,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => [
                'semester' => [
                    'semester_name' => $semester->SemesterName,
                    'academic_year' => $semester->AcademicYear,
                ],
                'exams' => $result
            ]
        ]);
    }

    /**
     * GET /api/dashboard/student/stats
     * Thống kê Đúng/Sai/Trống và Tiến độ.
     */
    public function studentStats(Request $request): JsonResponse
    {
        $user = $request->user();
        $student = $this->resolveStudent($user);
        $semester = $this->getCurrentSemester();

        if (!$student || !$semester) {
            return response()->json(['success' => true, 'data' => null]);
        }

        // Lấy SectionID sinh viên đăng ký trong kỳ
        $sectionIds = Enrollment::where('StudentID', $student->StudentID)
            ->where('Status', 1)
            ->whereHas('courseSection', fn($q) => $q->where('SemesterID', $semester->SemesterID))
            ->pluck('SectionID');

        $exams = Exam::with('courseSection.subject')->whereIn('SectionID', $sectionIds)->get();
        $examIds = $exams->pluck('ExamID');

        $attempts = ExamAttempt::where('StudentID', $student->StudentID)
            ->whereIn('ExamID', $examIds)
            ->whereIn('Status', ['submitted', 'expired'])
            ->with('result')
            ->get();

        // 1. Tiến độ hoàn thành
        $totalExams = $exams->count();
        $completedExams = $attempts->count();

        // 2. Thống kê Đúng/Sai/Trống theo môn
        $subjectStats = [];
        $examsBySubject = $exams->groupBy(fn($e) => $e->courseSection->subject->SubjectName);

        foreach ($examsBySubject as $subjectName => $subjectExams) {
            $subExamIds = $subjectExams->pluck('ExamID');
            $subAttempts = $attempts->whereIn('ExamID', $subExamIds);
            
            $correct = 0;
            $incorrect = 0;
            $unanswered = 0;

            foreach ($subAttempts as $att) {
                if (!$att->result) continue;
                
                $resId = $att->result->ResultID;
                $totalQ = (int) $att->exam->QuestionCount;
                
                $answers = StudentAnswer::where('ResultID', $resId)->get();
                $c = $answers->where('IsCorrect', true)->count();
                $w = $answers->where('IsCorrect', false)->filter(fn($a) => !empty($a->SelectedAnswer))->count();
                $u = $totalQ - ($c + $w);

                $correct += $c;
                $incorrect += $w;
                $unanswered += max(0, $u);
            }

            if ($subAttempts->count() > 0) {
                $subjectStats[] = [
                    'subject_name' => $subjectName,
                    'correct' => $correct,
                    'incorrect' => $incorrect,
                    'unanswered' => $unanswered,
                ];
            }
        }

        return response()->json([
            'success' => true,
            'data' => [
                'progress' => [
                    'total' => $totalExams,
                    'completed' => $completedExams,
                    'percent' => $totalExams > 0 ? round(($completedExams / $totalExams) * 100, 1) : 0,
                ],
                'answer_stats' => $subjectStats,
                'overview' => [
                    'avg_score' => round($attempts->avg(fn($a) => $a->result?->Score ?? 0), 2),
                    'total_questions' => $attempts->sum(fn($a) => $a->exam->QuestionCount),
                ]
            ]
        ]);
    }

    private function resolveStudent($user): ?StudentProfile
    {
        if ($user->IsTemporary && $user->OriginalUserID) {
            return StudentProfile::where('UserID', $user->OriginalUserID)->first();
        }
        return StudentProfile::where('UserID', $user->UserID)->first();
    }

    /**
     * Lấy học kỳ hiện tại.
     */
    private function getCurrentSemester(): ?Semester
    {
        $today = now()->toDateString();
        return Semester::query()
            ->where('StartDate', '<=', $today)
            ->where('EndDate', '>=', $today)
            ->first();
    }
}
