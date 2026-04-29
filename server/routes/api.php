<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\InstituteController;
use App\Http\Controllers\Api\DepartmentController;
use App\Http\Controllers\Api\TeacherProfileController;
use App\Http\Controllers\Api\SubjectController;
use App\Http\Controllers\Api\QuestionController;
use App\Http\Controllers\Api\QuestionBankController;
use App\Http\Controllers\Api\SemesterController;
use App\Http\Controllers\Api\CourseSectionController;
use App\Http\Controllers\Api\EnrollmentController;
use App\Http\Controllers\Api\ExamController;
use App\Http\Controllers\Api\ExamAttemptController;
use App\Http\Controllers\Api\FinalExamController;
use App\Http\Controllers\Api\KnowledgeController;
use App\Http\Controllers\Api\DashboardController;

Route::post('/auth/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // Enrollments (Shared - Admin & Teacher read)
    Route::get('/enrollments', [EnrollmentController::class, 'index']);
    Route::get('/enrollments/{id}', [EnrollmentController::class, 'show']);

    // Course Sections (Shared)
    Route::get('/course-sections', [CourseSectionController::class, 'index']);
    Route::get('/course-sections/{id}', [CourseSectionController::class, 'show']);

    // Subjects (Shared)
    Route::get('/subjects', [SubjectController::class, 'index']);
    Route::get('/subjects/{id}', [SubjectController::class, 'show']);

    Route::middleware('role.admin_or_teacher')->group(function () {
        // Dashboard
        Route::get('/dashboard/exams', [DashboardController::class, 'exams']);
        Route::get('/dashboard/exam-stats', [DashboardController::class, 'examStats']);

        // Exam helpers (phải đặt TRƯỚC route {id} để tránh conflict)
        Route::get('/exams/current-semester', [ExamController::class, 'currentSemester']);
        Route::get('/exams/subjects-for-semester', [ExamController::class, 'subjectsForSemester']);
        Route::get('/exams/banks-for-subject/{subjectId}', [ExamController::class, 'banksForSubject']);

        // Exam CRUD
        Route::get('/exams', [ExamController::class, 'index']);
        Route::get('/exams/{id}', [ExamController::class, 'show']);
        Route::post('/exams', [ExamController::class, 'store']);
        Route::put('/exams/{id}', [ExamController::class, 'update']);
        Route::delete('/exams/{id}', [ExamController::class, 'destroy']);

        // Exam Attempts — helpers (đặt TRƯỚC route {id})
        Route::get('/exam-attempts/by-exam/{examId}', [ExamAttemptController::class, 'byExam']);
        Route::get('/exam-attempts/by-student/{studentId}', [ExamAttemptController::class, 'byStudent']);
        Route::get('/exam-attempts/export', [ExamAttemptController::class, 'export']);
        // Exam Attempts — CRUD read
        Route::get('/exam-attempts', [ExamAttemptController::class, 'index']);
        Route::get('/exam-attempts/{id}', [ExamAttemptController::class, 'show']);
        Route::post('/exam-attempts', [ExamAttemptController::class, 'store']);

        // Results
        Route::get('/results', [\App\Http\Controllers\Api\ResultController::class, 'index']);
        Route::get('/results/by-attempt/{attemptId}', [\App\Http\Controllers\Api\ResultController::class, 'byAttempt']);
        Route::get('/results/{id}', [\App\Http\Controllers\Api\ResultController::class, 'show']);

        // Grading
        Route::get('/grading/pending', [\App\Http\Controllers\Api\GradeController::class, 'pending']);
        Route::get('/grading/{resultId}', [\App\Http\Controllers\Api\GradeController::class, 'show']);
        Route::post('/grading/{resultId}', [\App\Http\Controllers\Api\GradeController::class, 'update']);
        Route::post('/grading/ai-grade-answer/{answerId}', [\App\Http\Controllers\Api\GradeController::class, 'triggerAIGrading']);

        Route::get('/institutes', [InstituteController::class, 'index']);
        Route::get('/institutes/{id}', [InstituteController::class, 'show']);

        Route::get('/departments', [DepartmentController::class, 'index']);
        Route::get('/departments/{id}', [DepartmentController::class, 'show']);

        Route::get('/semesters', [SemesterController::class, 'index']);
        Route::get('/semesters/{id}', [SemesterController::class, 'show']);


        // Questions
        Route::get('/questions', [QuestionController::class, 'index']);
        Route::post('/questions', [QuestionController::class, 'store']);
        Route::post('/questions/import', [QuestionController::class, 'import']);
        Route::get('/questions/{id}', [QuestionController::class, 'show']);
        Route::put('/questions/{id}', [QuestionController::class, 'update']);
        Route::delete('/questions/{id}', [QuestionController::class, 'destroy']);

        Route::get('/question-banks', [QuestionBankController::class, 'index']);
        Route::get('/question-banks/{id}', [QuestionBankController::class, 'show']);
        Route::post('/question-banks', [QuestionBankController::class, 'store']);
        Route::put('/question-banks/{id}', [QuestionBankController::class, 'update']);
        Route::delete('/question-banks/{id}', [QuestionBankController::class, 'destroy']);
        Route::post('/question-banks/{bankId}/chapters', [QuestionBankController::class, 'storeChapter']);
        Route::put('/question-banks/{bankId}/chapters/{chapterId}', [QuestionBankController::class, 'updateChapter']);
        Route::delete('/question-banks/{bankId}/chapters/{chapterId}', [QuestionBankController::class, 'destroyChapter']);
        Route::post('/question-banks/{bankId}/chapters/{chapterId}/questions', [QuestionBankController::class, 'addQuestions']);
        Route::delete('/question-banks/{bankId}/chapters/{chapterId}/questions', [QuestionBankController::class, 'removeQuestions']);

        Route::get('/profile/me', [TeacherProfileController::class, 'myProfile']);
        Route::put('/profile/me', [TeacherProfileController::class, 'updateMyProfile']);
        Route::get('/student-profiles/export', [\App\Http\Controllers\Api\StudentProfileController::class, 'export']);
        Route::get('/student-profiles', [\App\Http\Controllers\Api\StudentProfileController::class, 'index']);
        Route::get('/student-profiles/{id}', [\App\Http\Controllers\Api\StudentProfileController::class, 'show']);

    });

    Route::middleware('role.admin')->group(function () {
        Route::get('/users', [UserController::class, 'index']);
        Route::post('/users', [UserController::class, 'store']);
        Route::get('/users/{id}', [UserController::class, 'show']);
        Route::put('/users/{id}', [UserController::class, 'update']);
        Route::delete('/users/{id}', [UserController::class, 'destroy']);

        Route::post('/institutes', [InstituteController::class, 'store']);
        Route::put('/institutes/{id}', [InstituteController::class, 'update']);
        Route::delete('/institutes/{id}', [InstituteController::class, 'destroy']);

        Route::post('/departments', [DepartmentController::class, 'store']);
        Route::put('/departments/{id}', [DepartmentController::class, 'update']);
        Route::delete('/departments/{id}', [DepartmentController::class, 'destroy']);

        Route::post('/semesters', [SemesterController::class, 'store']);
        Route::put('/semesters/{id}', [SemesterController::class, 'update']);
        Route::delete('/semesters/{id}', [SemesterController::class, 'destroy']);

        Route::post('/subjects', [SubjectController::class, 'store']);
        Route::put('/subjects/{id}', [SubjectController::class, 'update']);
        Route::delete('/subjects/{id}', [SubjectController::class, 'destroy']);

        Route::get('/teachers/export', [TeacherProfileController::class, 'export']);
        Route::get('/teachers', [TeacherProfileController::class, 'index']);
        Route::post('/teachers', [TeacherProfileController::class, 'store']);
        Route::get('/teachers/{id}', [TeacherProfileController::class, 'show']);
        Route::put('/teachers/{id}', [TeacherProfileController::class, 'update']);
        Route::delete('/teachers/{id}', [TeacherProfileController::class, 'destroy']);

        Route::post('/student-profiles', [\App\Http\Controllers\Api\StudentProfileController::class, 'store']);
        Route::put('/student-profiles/{id}', [\App\Http\Controllers\Api\StudentProfileController::class, 'update']);
        Route::delete('/student-profiles/{id}', [\App\Http\Controllers\Api\StudentProfileController::class, 'destroy']);

        Route::post('/course-sections', [CourseSectionController::class, 'store']);
        Route::put('/course-sections/{id}', [CourseSectionController::class, 'update']);
        Route::delete('/course-sections/{id}', [CourseSectionController::class, 'destroy']);

        // Enrollments (Admin only)
        Route::post('/enrollments', [EnrollmentController::class, 'store']);
        Route::put('/enrollments/{id}', [EnrollmentController::class, 'update']);
        Route::delete('/enrollments/{id}', [EnrollmentController::class, 'destroy']);

        // Exam Attempts — write (Admin only)
        Route::put('/exam-attempts/{id}', [ExamAttemptController::class, 'update']);
        Route::delete('/exam-attempts/{id}', [ExamAttemptController::class, 'destroy']);
        Route::post('/exam-attempts/{id}/analyze', [ExamAttemptController::class, 'analyze']);
        Route::post('/exam-attempts/by-student/{studentId}/analyze', [ExamAttemptController::class, 'analyzeStudent']);
        Route::post('/exam-attempts/by-exam/{examId}/analyze', [ExamAttemptController::class, 'analyzeExam']);

        // Final Exams (Admin only)
        Route::get('/final-exams', [FinalExamController::class, 'index']);
        Route::post('/final-exams', [FinalExamController::class, 'store']);
        Route::get('/final-exams/{examId}/students', [FinalExamController::class, 'students']);
        Route::get('/final-exams/{examId}/accounts', [FinalExamController::class, 'getAccounts']);
        Route::post('/final-exams/{examId}/generate-accounts', [FinalExamController::class, 'generateAccounts']);

        // Knowledge Base (Admin)
        Route::get('/knowledge', [KnowledgeController::class, 'index']);
        Route::post('/knowledge', [KnowledgeController::class, 'store']);
        Route::delete('/knowledge/{id}', [KnowledgeController::class, 'destroy']);
    });

    // ─── Student routes ─────────────────────────────────────────
    Route::middleware('role.student')->prefix('student')->group(function () {
        Route::get('/dashboard/exams', [DashboardController::class, 'studentExams']);
        Route::get('/dashboard/stats', [DashboardController::class, 'studentStats']);

        Route::get('/exams', [\App\Http\Controllers\Api\StudentExamController::class, 'myExams']);
        Route::get('/exam-history', [\App\Http\Controllers\Api\StudentExamController::class, 'examHistory']);
        Route::get('/profile', [\App\Http\Controllers\Api\StudentExamController::class, 'myProfile']);
        Route::put('/profile', [\App\Http\Controllers\Api\StudentExamController::class, 'updateMyProfile']);

        // Practice Exams
        Route::get('/practice-exams', [\App\Http\Controllers\Api\StudentPracticeExamController::class, 'index']);
        Route::post('/practice-exams', [\App\Http\Controllers\Api\StudentPracticeExamController::class, 'store']);
        Route::get('/practice-exams/{id}', [\App\Http\Controllers\Api\StudentPracticeExamController::class, 'show']);

        // Exam operations
        Route::post('/exams/{id}/verify-password', [\App\Http\Controllers\Api\StudentExamController::class, 'verifyPassword']);
        Route::get('/exams/{id}/take', [\App\Http\Controllers\Api\StudentExamController::class, 'takeExam']);
        Route::post('/exams/{id}/submit', [\App\Http\Controllers\Api\StudentExamController::class, 'submitExam']);

        // Knowledge AI Chat (Student)
        Route::post('/ai/ask', [KnowledgeController::class, 'ask']);
    });
});
