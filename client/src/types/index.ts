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
}

export interface DepartmentPayload {
    department_name: string;
    institute_id: string;
    description?: string;
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
    }[];
}

export interface QuestionChapterRow {
    chapter_id: number;
    chapter_number: number;
    chapter_name: string;
    description?: string | null;
    question_count: number;
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
}
