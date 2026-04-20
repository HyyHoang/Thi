// =====================
// Auth
// =====================
export interface LoginCredentials {
    username: string;
    password: string;
}

export interface AuthResponse {
    access_token: string;
    token_type: string;
    user: User;
}

// =====================
// User
// =====================
export interface User {
    user_id: string;
    username: string;
    email: string;
    role: number; // 0 = admin, 1 = normal user, 2 = student
    avt?: string;
    created_date?: string;
    Username?: string;
    Email?: string;
}

// =====================
// Institute
// =====================
export interface Institute {
    institute_id: string;
    institute_name: string;
    description?: string;
    created_date?: string;
}

export interface InstitutePayload {
    institute_name: string;
    description?: string;
}

// =====================
// Department
// =====================
export interface Department {
    department_id: string;
    department_name: string;
    institute_id: string;
    institute_name?: string;
    description?: string;
    DepartmentName?: string;
}

export interface DepartmentPayload {
    department_name: string;
    institute_id: string;
    description?: string;
}

// =====================
// Semester
// =====================
export interface Semester {
    semester_id: string;
    semester_name: string;
    academic_year: string;
    start_date: string;
    end_date: string;
}

export interface SemesterPayload {
    semester_name: string;
    academic_year: string;
    start_date: string;
    end_date: string;
}

// =====================
// User Payload
// =====================
export interface UserPayload {
    username?: string;
    email?: string;
    password?: string;
    role?: number;
    avt?: string;
}

// =====================
// API Response wrapper
// =====================
export interface ApiListResponse<T> {
    data: T[];
    message?: string;
}

export interface ApiSingleResponse<T> {
    data: T;
    message?: string;
}

// =====================
// Teacher Profile
// =====================
export interface TeacherProfile {
    teacher_id: string;
    user_id: string;
    department_id: string;
    full_name: string;
    gender?: string;
    birth_date?: string;
    phone?: string;
    degree?: string;
    academic_rank?: string;
    created_date?: string;
    department?: {
        department_id: string;
        department_name: string;
    };
    user?: {
        id: string;
        name: string;
        email: string;
        avt?: string;
    };
}

export interface TeacherProfilePayload {
    user_id?: string;
    department_id?: string;
    full_name: string;
    gender?: string;
    birth_date?: string;
    phone?: string;
    degree?: string;
    academic_rank?: string;
    avt?: string;
}

// =====================
// Subject
// =====================
export interface Subject {
    SubjectID: string;
    DepartmentID: string;
    SubjectName: string;
    Description?: string;
    Credit: number;
    department?: Department;
}

export interface SubjectPayload {
    SubjectName: string;
    DepartmentID: string;
    Credit: number | string;
    Description?: string;
}

// =====================
// Question
// =====================
export interface QuestionOption {
    OptionID: number;
    QuestionID?: string;
    Content: string;
    IsCorrect: boolean | number;
    OrderNumber: number;
}

export interface Question {
    QuestionID: string;
    SubjectID: string | null;
    BankID: string | null;
    ChapterNumber: number | null;
    Content: string;
    CorrectAnswer: string | null;
    UserID: string | null;
    Type: 'single' | 'multiple' | 'essay';
    options?: QuestionOption[];
}

export interface QuestionPayload {
    SubjectID?: string;
    BankID?: string;
    ChapterNumber?: string | number;
    Content: string;
    CorrectAnswer?: string;
    Type: 'single' | 'multiple' | 'essay';
    options?: QuestionOption[];
}

// =====================
// Question bank
// =====================
export interface QuestionBank {
    bank_id: string;
    bank_name: string;
    subject_id: string;
    subject_name?: string;
    chapter_count: number;
    user_id: string;
    creator_username?: string;
    created_date?: string;
    description?: string;
}

export interface QuestionBankPayload {
    bank_name: string;
    subject_id: string;
    description?: string;
}

/** Payload tạo mới — bắt buộc kèm danh sách chương */
export interface QuestionBankCreatePayload extends QuestionBankPayload {
    chapters: {
        chapter_number: number;
        chapter_name: string;
        description?: string;
        chapter_type: string;
    }[];
}

export interface QuestionChapterRow {
    chapter_id: number;
    chapter_number: number;
    chapter_name: string;
    description?: string | null;
    question_count: number;
    chapter_type: 'mcq' | 'essay';
}

export interface QuestionBankDetail {
    bank: QuestionBank;
    chapters: QuestionChapterRow[];
    total_questions: number;
}

export interface QuestionChapterPayload {
    chapter_number: number;
    chapter_name: string;
    description?: string;
    chapter_type?: string;
}

// =====================
// Student Profile
// =====================
export interface StudentProfile {
    StudentID: string;
    UserID?: string | null;
    DepartmentID?: string | null;
    FullName: string;
    EnrollmentYear: number;
    Status: number;
    DateOfBirth?: string | null;
    Hometown?: string | null;
    Gender?: number | null;
    user?: User;
    department?: Department;
}

export interface StudentProfilePayload {
    UserID?: string | null;
    DepartmentID?: string | null;
    FullName: string;
    EnrollmentYear: number;
    Status?: number;
    DateOfBirth?: string | null;
    Hometown?: string | null;
    Gender?: number | null;
}

// =====================
// Course Section
// =====================
export interface CourseSection {
    SectionID: string;
    SubjectID: string;
    SemesterID: string;
    TeacherID: string;
    SectionName: string;
    MaxStudent: number;
    CreatedDate?: string;
    Subject?: {
        SubjectID: string;
        SubjectName: string;
    };
    Semester?: {
        SemesterID: string;
        SemesterName: string;
    };
    Teacher?: {
        TeacherID: string;
        FullName: string;
    };
}

export interface CourseSectionPayload {
    SectionName: string;
    SubjectID: string;
    SemesterID: string;
    TeacherID: string;
    MaxStudent: number | string;
}

// =====================
// Exam
// =====================
export interface ExamChapterConfig {
    bank_id: string;
    bank_name?: string;
    chapter_number: number;
    question_count: number;
    weight?: number;
}

export interface Exam {
    exam_id: string;
    title: string;
    is_final_exam?: boolean;
    section_id?: string;
    section_name?: string;
    duration: number;
    start_time: string;
    end_time: string;
    password_enabled: boolean;
    password_exam?: string | null;
    is_fullscreen?: boolean;
    is_prevent_copy?: boolean;
    question_count: number;
    created_by: string;
    creator_username?: string;
    created_date?: string;
    semester_id?: string;
    semester_name?: string;
    subject_id?: string;
    subject_name?: string;
    chapter_configs?: ExamChapterConfig[];
    mcq_weight: number;
    essay_weight: number;
}

export interface ExamPayload {
    title: string;
    section_id?: string;
    subject_id?: string;
    duration: number;
    start_time: string;
    end_time: string;
    password_exam?: string | null;
    is_fullscreen?: boolean;
    is_prevent_copy?: boolean;
    chapter_configs: ExamChapterConfig[];
    mcq_weight: number;
    essay_weight: number;
    is_final_exam?: boolean;
}

// =====================
// Enrollment
// =====================
export interface Enrollment {
    EnrollmentID: string;
    SectionID: string;
    StudentID: string;
    EnrollDate: string;
    Status: number;
    course_section?: {
        SectionID: string;
        SectionName: string;
        MaxStudent: number;
        Subject?: {
            SubjectID: string;
            SubjectName: string;
        } | null;
        Semester?: {
            SemesterID: string;
            SemesterName: string;
        } | null;
        Teacher?: {
            TeacherID: string;
            FullName: string;
        } | null;
    } | null;
    student_profile?: {
        StudentID: string;
        FullName: string;
        EnrollmentYear: number;
        Status: number;
        Department?: {
            DepartmentID: string;
            DepartmentName: string;
        } | null;
    } | null;
}

// =====================
// Student Exam (for student-facing exam list)
// =====================
export interface StudentExam {
    exam_id: string;
    title: string;
    section_id: string;
    section_name: string;
    subject_name: string;
    semester_name: string;
    duration: number;
    question_count: number;
    password_enabled: boolean;
    is_fullscreen: boolean;
    is_prevent_copy: boolean;
    start_time: string;
    end_time: string;
    status: 'upcoming' | 'active' | 'expired' | 'completed';
    attempt?: {
        attempt_id: number;
        status: string;
        start_time?: string;
        submit_time?: string;
        score?: number;
        correct_answers?: number;
        working_time?: number;
    } | null;
}

// =====================
// Exam Attempt
// =====================
export interface ExamAttempt {
    attempt_id: number;
    exam_id: string;
    exam_title?: string;
    subject_name?: string;
    semester_name?: string;
    section_name?: string;
    student_id: string;
    student_name?: string;
    start_time: string;
    submit_time?: string | null;
    status: 'in_progress' | 'submitted' | 'expired';
    ip_address?: string;
    is_final_exam?: boolean;
}

export interface ExamAttemptPayload {
    exam_id?: string;
    student_id?: string;
    status?: string;
    submit_time?: string;
    ip_address?: string;
}

// =====================
// Result & StudentAnswer
// =====================
export interface ResultStudentAnswer {
    student_answer_id: number;
    question_id: string;
    question_type?: 'single' | 'multiple' | 'essay';
    content?: string;
    selected_answer?: string;
    is_correct: boolean;
    correct_answer?: string | null;
    raw_score?: number | null;
}

export interface Result {
    result_id: number;
    attempt_id: number;
    score: number | string;
    correct_answers: number;
    working_time: number;
    mcq_score?: number;
    essay_score?: number;
    is_graded?: boolean;
    created_at?: string;

    // Nested objects from detail API
    student?: {
        student_id: string;
        student_name: string;
    } | null;
    exam?: {
        exam_id: string;
        exam_title: string;
        mcq_weight?: number;
        essay_weight?: number;
    } | null;
    student_answers?: ResultStudentAnswer[];

    // Flat fields from list API
    student_id?: string;
    student_name?: string;
    exam_id?: string;
    exam_title?: string;
}
