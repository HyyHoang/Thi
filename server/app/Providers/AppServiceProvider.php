<?php

namespace App\Providers;

use App\Repositories\Contracts\DepartmentRepositoryInterface;
use App\Repositories\Contracts\InstituteRepositoryInterface;
use App\Repositories\Contracts\UserRepositoryInterface;
use App\Repositories\DepartmentRepository;
use App\Repositories\InstituteRepository;
use App\Repositories\UserRepository;
use App\Services\Contracts\DepartmentServiceInterface;
use App\Services\Contracts\InstituteServiceInterface;
use App\Services\Contracts\UserServiceInterface;
use App\Services\DepartmentService;
use App\Services\InstituteService;
use App\Services\UserService;
use App\Repositories\Contracts\TeacherProfileRepositoryInterface;
use App\Repositories\TeacherProfileRepository;
use App\Services\Contracts\TeacherProfileServiceInterface;
use App\Services\TeacherProfileService;
use App\Repositories\Contracts\SubjectRepositoryInterface;
use App\Repositories\SubjectRepository;
use App\Services\Contracts\SubjectServiceInterface;
use App\Services\SubjectService;
use App\Repositories\Contracts\QuestionRepositoryInterface;
use App\Repositories\Contracts\QuestionBankRepositoryInterface;
use App\Repositories\Contracts\SemesterRepositoryInterface;
use App\Repositories\QuestionRepository;
use App\Repositories\QuestionBankRepository;
use App\Repositories\SemesterRepository;
use App\Services\Contracts\QuestionServiceInterface;
use App\Services\Contracts\QuestionBankServiceInterface;
use App\Services\Contracts\SemesterServiceInterface;
use App\Services\QuestionService;
use App\Services\QuestionBankService;
use App\Services\SemesterService;
use Illuminate\Support\ServiceProvider;
use App\Repositories\Contracts\ExamRepositoryInterface;
use App\Repositories\ExamRepository;
use App\Services\Contracts\ExamServiceInterface;
use App\Services\ExamService;
use App\Repositories\Contracts\ExamAttemptRepositoryInterface;
use App\Repositories\ExamAttemptRepository;
use App\Services\Contracts\ExamAttemptServiceInterface;
use App\Services\ExamAttemptService;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     * Bind interface → concrete implementation vào IoC container.
     */
    public function register(): void
    {
        // Department
        $this->app->bind(DepartmentRepositoryInterface::class, DepartmentRepository::class);
        $this->app->bind(DepartmentServiceInterface::class, DepartmentService::class);

        // User
        $this->app->bind(UserRepositoryInterface::class, UserRepository::class);
        $this->app->bind(UserServiceInterface::class, UserService::class);

        // Institute
        $this->app->bind(InstituteRepositoryInterface::class, InstituteRepository::class);
        $this->app->bind(InstituteServiceInterface::class, InstituteService::class);

        // Teacher Profile
        $this->app->bind(TeacherProfileRepositoryInterface::class, TeacherProfileRepository::class);
        $this->app->bind(TeacherProfileServiceInterface::class, TeacherProfileService::class);

        // Subject
        $this->app->bind(SubjectRepositoryInterface::class, SubjectRepository::class);
        $this->app->bind(SubjectServiceInterface::class, SubjectService::class);

        // Question
        $this->app->bind(QuestionRepositoryInterface::class, QuestionRepository::class);
        $this->app->bind(QuestionServiceInterface::class, QuestionService::class);

        // Question bank
        $this->app->bind(QuestionBankRepositoryInterface::class, QuestionBankRepository::class);
        $this->app->bind(QuestionBankServiceInterface::class, QuestionBankService::class);

        // Semester
        $this->app->bind(SemesterRepositoryInterface::class, SemesterRepository::class);
        $this->app->bind(SemesterServiceInterface::class, SemesterService::class);

        // Student Profile
        $this->app->bind(\App\Repositories\Contracts\StudentProfileRepositoryInterface::class, \App\Repositories\StudentProfileRepository::class);
        $this->app->bind(\App\Services\Contracts\StudentProfileServiceInterface::class, \App\Services\StudentProfileService::class);

        // Course Section
        $this->app->bind(\App\Repositories\Contracts\CourseSectionRepositoryInterface::class, \App\Repositories\CourseSectionRepository::class);
        $this->app->bind(\App\Services\Contracts\CourseSectionServiceInterface::class, \App\Services\CourseSectionService::class);

        // Enrollment
        $this->app->bind(\App\Repositories\Contracts\EnrollmentRepositoryInterface::class, \App\Repositories\EnrollmentRepository::class);
        $this->app->bind(\App\Services\Contracts\EnrollmentServiceInterface::class, \App\Services\EnrollmentService::class);

        // Exam
        $this->app->bind(ExamRepositoryInterface::class, ExamRepository::class);
        $this->app->bind(ExamServiceInterface::class, ExamService::class);

        // Exam Attempt
        $this->app->bind(ExamAttemptRepositoryInterface::class, ExamAttemptRepository::class);
        $this->app->bind(ExamAttemptServiceInterface::class, ExamAttemptService::class);

        // Result
        $this->app->bind(\App\Repositories\Contracts\ResultRepositoryInterface::class, \App\Repositories\ResultRepository::class);
        $this->app->bind(\App\Services\Contracts\ResultServiceInterface::class, \App\Services\ResultService::class);

        // Student Answer
        $this->app->bind(\App\Repositories\Contracts\StudentAnswerRepositoryInterface::class, \App\Repositories\StudentAnswerRepository::class);
        $this->app->bind(\App\Services\Contracts\StudentAnswerServiceInterface::class, \App\Services\StudentAnswerService::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
