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
use Illuminate\Support\Facades\Cache;
use App\Models\Question;
use App\Models\Result;
use App\Models\StudentAnswer;
use Carbon\Carbon;

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
                        $result['attempt']['is_graded']       = (bool) $resultModel->IsGraded;
                    }
                }

                $result['essay_weight'] = (float) ($exam->EssayWeight ?? 0);
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

    /**
     * PUT /api/student/profile
     * Cập nhật thông tin cá nhân sinh viên (chỉ các trường cho phép)
     */
    public function updateMyProfile(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'full_name'     => 'required|string|max:100',
            'date_of_birth' => 'nullable|date',
            'hometown'      => 'nullable|string|max:255',
            'gender'        => 'nullable|integer|in:0,1',
        ]);

        $user = $request->user();
        $student = StudentProfile::where('UserID', $user->UserID)->first();

        if (!$student) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy hồ sơ sinh viên.',
            ], 404);
        }

        $student->update([
            'FullName'    => $validated['full_name'],
            'DateOfBirth' => $validated['date_of_birth'] ?? null,
            'Hometown'    => $validated['hometown'] ?? null,
            'Gender'      => $validated['gender'] ?? null,
        ]);

        // Reload with relations
        $student->load(['department', 'user']);

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật hồ sơ thành công.',
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

    /**
     * POST /api/student/exams/{id}/verify-password
     */
    public function verifyPassword(Request $request, $id): JsonResponse
    {
        $request->validate(['password' => 'required|string']);

        $user = $request->user();
        $student = StudentProfile::where('UserID', $user->UserID)->first();
        if (!$student) return response()->json(['success' => false, 'message' => 'Not a student.'], 403);

        $exam = Exam::find($id);
        if (!$exam) return response()->json(['success' => false, 'message' => 'Exam not found.'], 404);

        $cacheKey = 'exam_pwd_fails:' . $student->StudentID . ':' . $exam->ExamID;
        $fails = Cache::get($cacheKey, 0);
        $blockedUntil = Cache::get($cacheKey . '_block');

        if ($blockedUntil && now()->lt($blockedUntil)) {
            $seconds = now()->diffInSeconds($blockedUntil);
            return response()->json([
                'success' => false,
                'message' => 'Bạn đã nhập sai quá nhiều lần. Vui lòng thử lại sau.',
                'blocked_seconds' => $seconds
            ], 429);
        }

        // Kiểm tra mật khẩu
        if ($exam->PasswordExam !== $request->password) {
            $fails++;
            
            $endOfDay = now()->endOfDay();
            // Lưu trạng thái đếm số lần sai, tối đa đến cuối ngày (để reset sang hôm sau)
            Cache::put($cacheKey, $fails, $endOfDay);
            
            if ($fails % 3 === 0) {
                // block logic: 5p, 35p, 65p...
                // (fails / 3 - 1) * 30 + 5 
                $blockMinutes = 5 + (($fails / 3) - 1) * 30;
                $blockUntil = now()->addMinutes($blockMinutes);
                
                // Nếu thời gian khóa vượt quá cuối ngày, chỉ khóa tới cuối ngày
                if ($blockUntil->gt($endOfDay)) {
                    $blockUntil = $endOfDay;
                }
                
                Cache::put($cacheKey . '_block', $blockUntil, $blockUntil);
                return response()->json([
                    'success' => false,
                    'message' => 'Sai mật khẩu 3 lần liên tiếp. Bị khóa thi tạm thời.',
                    'blocked_seconds' => now()->diffInSeconds($blockUntil)
                ], 429);
            }

            return response()->json([
                'success' => false,
                'message' => 'Mật khẩu bài thi không chính xác.',
                'remaining_attempts' => 3 - ($fails % 3)
            ], 400);
        }

        // Đúng password -> reset fails
        Cache::forget($cacheKey);
        Cache::forget($cacheKey . '_block');

        return response()->json([
            'success' => true,
            'message' => 'Xác thực thành công.'
        ]);
    }

    /**
     * GET /api/student/exams/{id}/take
     * Lấy cấu hình bài thi và nội dung câu hỏi
     */
    public function takeExam(Request $request, $id): JsonResponse
    {
        $user = $request->user();
        $student = StudentProfile::where('UserID', $user->UserID)->first();
        if (!$student) return response()->json(['success' => false], 403);

        $exam = Exam::with('chapterConfigs')->find($id);
        if (!$exam) return response()->json(['success' => false, 'message' => 'Exam not found.'], 404);

        if (now()->lt($exam->StartTime)) return response()->json(['success' => false, 'message' => 'Chưa đến giờ thi'], 400);
        if (now()->gt($exam->EndTime)) return response()->json(['success' => false, 'message' => 'Đã quá hạn thi'], 400);

        // Tạo attempt nếu chưa có
        $attempt = ExamAttempt::firstOrCreate(
            ['ExamID' => $exam->ExamID, 'StudentID' => $student->StudentID],
            ['StartTime' => now(), 'Status' => 'in_progress', 'IPAddress' => $request->ip()]
        );

        if ($attempt->Status !== 'in_progress') {
            return response()->json(['success' => false, 'message' => 'Bài thi này đã hoàn thành hoặc hết hạn.'], 400);
        }

        // Lấy câu hỏi từ config
        // Để đơn giản (trong thực tế có thể random và lưu cache/db cho mỗi attempt)
        // Ở đây lấy random câu hỏi theo chapter configs
        $questions = [];
        foreach ($exam->chapterConfigs as $config) {
            $chapterQuestions = Question::where('BankID', $config->BankID)
                                        ->where('ChapterNumber', $config->ChapterNumber)
                                        ->with('options')
                                        ->inRandomOrder()
                                        ->limit($config->QuestionCount)
                                        ->get();
            foreach ($chapterQuestions as $q) {
                // Ẩn isCorrect để chống gian lận
                $options = $q->options->map(function($o) {
                    return [
                        'OptionID' => $o->OptionID,
                        'QuestionID' => $o->QuestionID,
                        'Content' => $o->Content,
                    ];
                });
                $questions[] = [
                    'QuestionID' => $q->QuestionID,
                    'Type' => $q->Type,
                    'Content' => $q->Content,
                    'Score' => $q->Score,
                    'options' => $options
                ];
            }
        }

        return response()->json([
            'success' => true,
            'data' => [
                'exam' => [
                    'exam_id' => $exam->ExamID,
                    'title' => $exam->Title,
                    'duration' => $exam->Duration,
                    'is_fullscreen' => $exam->IsFullscreen,
                    'is_prevent_copy' => $exam->IsPreventCopy,
                ],
                'attempt' => $attempt,
                'questions' => $questions
            ]
        ]);
    }

    /**
     * POST /api/student/exams/{id}/submit
     */
    public function submitExam(Request $request, $id): JsonResponse
    {
        $user = $request->user();
        $student = StudentProfile::where('UserID', $user->UserID)->first();
        if (!$student) return response()->json(['success' => false], 403);

        $attempt = ExamAttempt::where('ExamID', $id)->where('StudentID', $student->StudentID)->first();
        if (!$attempt || $attempt->Status !== 'in_progress') {
            return response()->json(['success' => false, 'message' => 'Không thể nộp bài (bị lỗi attempt)'], 400);
        }

        $answers = $request->input('answers', []); // ['QuestionID' => 'OptionID' / Text]
        
        $exam = Exam::find($id);
        if (!$exam) {
            return response()->json(['success' => false, 'message' => 'Bài thi không tồn tại.'], 404);
        }

        $attempt->SubmitTime = now();
        $attempt->Status = 'submitted';
        $attempt->save();

        // Lấy thông tin tất cả câu hỏi cùng loại chương
        $questionIds = array_keys($answers);
        $questions = Question::query()
            ->join('question_chapters', function($join) {
                $join->on('question.BankID', '=', 'question_chapters.BankID')
                     ->on('question.ChapterNumber', '=', 'question_chapters.ChapterNumber');
            })
            ->select('question.*', 'question_chapters.ChapterType')
            ->with('options')
            ->whereIn('QuestionID', $questionIds)
            ->get()
            ->keyBy('QuestionID');

        $mcqTotalCount = 0;
        $mcqCorrectCount = 0;
        $hasEssay = false;
        $details = [];

        foreach ($answers as $qID => $answerVal) {
            $q = $questions->get($qID);
            $isCorrect = false;
            
            if ($q) {
                if ($q->ChapterType === 'essay') {
                    $hasEssay = true;
                    $isCorrect = false; 
                } else {
                    // ChapterType is 'mcq'
                    $mcqTotalCount++;
                    // Check trắc nghiệm
                    $correctOption = $q->options->where('IsCorrect', true)->first();
                    if ($correctOption && (string)$correctOption->OptionID === (string)$answerVal) {
                        $isCorrect = true;
                        $mcqCorrectCount++;
                    }
                }

                $details[] = [
                    'ResultID'      => null, // Sẽ gán sau
                    'QuestionID'    => $qID,
                    'SelectedAnswer' => (string)$answerVal,
                    'IsCorrect'     => $isCorrect,
                    'RawScore'      => null,
                    'CreatedAt'     => now(),
                    'UpdatedAt'     => now(),
                ];
            }
        }

        // Tính điểm trắc nghiệm theo MCQWeight (thang 10)
        // Nếu MCQWeight là 7.0, tối đa SV được 7.0 điểm MCQ
        $mcqScore = $mcqTotalCount > 0 ? ($mcqCorrectCount / $mcqTotalCount) * ($exam->MCQWeight ?? 10) : 0;
        
        // Điểm hiển thị tổng quát (vẫn giữ thang 10 cho tương thích các module cũ nếu cần)
        $displayScore = $mcqTotalCount > 0 ? ($mcqCorrectCount / $mcqTotalCount) * 10 : 0;

        $result = Result::create([
            'AttemptID'      => $attempt->AttemptID,
            'CorrectAnswers' => $mcqCorrectCount,
            'Score'          => round($displayScore, 2),
            'MCQScore'       => round($mcqScore, 2),
            'EssayScore'     => 0,
            'IsGraded'       => !$hasEssay || ($exam->EssayWeight ?? 0) <= 0,
            'WorkingTime'    => abs((int) now()->diffInSeconds(Carbon::parse($attempt->StartTime)))
        ]);

        // Cập nhật ResultID cho details và insert
        foreach ($details as &$detail) {
            $detail['ResultID'] = $result->ResultID;
        }

        if (count($details) > 0) {
            StudentAnswer::insert($details);
        }

        return response()->json([
            'success' => true,
            'message' => 'Nộp bài thành công',
            'data' => [
                'correct'   => $mcqCorrectCount,
                'total_mcq' => $mcqTotalCount,
                'mcq_score' => $result->MCQScore,
                'has_essay' => $hasEssay,
                'is_graded' => $result->IsGraded
            ]
        ]);
    }

    /**
     * GET /api/student/exam-history
     * Lấy toàn bộ lịch sử các lần thi của sinh viên.
     */
    public function examHistory(Request $request): JsonResponse
    {
        $user = $request->user();
        $student = StudentProfile::where('UserID', $user->UserID)->first();

        if (!$student) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy hồ sơ sinh viên.',
            ], 404);
        }

        // Lấy tất cả attempt cùng thông tin bài thi và kết quả
        $attempts = ExamAttempt::where('StudentID', $student->StudentID)
            ->with(['exam.courseSection.subject', 'exam.courseSection.semester'])
            ->orderBy('StartTime', 'desc')
            ->get();

        $history = $attempts->map(function ($attempt) {
            $exam = $attempt->exam;
            $section = $exam?->courseSection;
            $subject = $section?->subject;
            $semester = $section?->semester;

            $resultModel = Result::where('AttemptID', $attempt->AttemptID)->first();

            return [
                'attempt_id'   => $attempt->AttemptID,
                'exam_id'      => $exam?->ExamID,
                'exam_title'   => $exam?->Title,
                'subject_name' => $subject?->SubjectName,
                'semester'     => $semester ? "{$semester->SemesterName} ({$semester->AcademicYear})" : null,
                'start_time'   => $attempt->StartTime?->format('Y-m-d H:i:s'),
                'submit_time'  => $attempt->SubmitTime?->format('Y-m-d H:i:s'),
                'status'       => $attempt->Status,
                'score'        => $resultModel ? (float)$resultModel->Score : null,
                'correct'      => $resultModel ? (int)$resultModel->CorrectAnswers : null,
                'total'        => $exam?->QuestionCount,
                'duration'     => $exam?->Duration,
                'working_time' => $resultModel ? (int)$resultModel->WorkingTime : null,
                'is_graded'    => $resultModel ? (bool)$resultModel->IsGraded : null,
                'essay_weight' => (float) ($exam?->EssayWeight ?? 0),
            ];
        });

        return response()->json([
            'success' => true,
            'data'    => $history,
        ]);
    }
}
