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
    user_id: number;
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
    institute_id: number;
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
    department_id: number;
    department_name: string;
    institute_id: number;
    institute_name?: string;
    description?: string;
}

export interface DepartmentPayload {
    department_name: string;
    institute_id: number | string;
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
    teacher_id: number;
    user_id: number;
    department_id: number;
    full_name: string;
    gender?: string;
    birth_date?: string;
    phone?: string;
    degree?: string;
    academic_rank?: string;
    created_date?: string;
    department?: {
        department_id: number;
        department_name: string;
    };
    user?: {
        id: number;
        name: string;
        email: string;
        avt?: string;
    };
}

export interface TeacherProfilePayload {
    user_id?: number | string;
    department_id?: number | string;
    full_name: string;
    gender?: string;
    birth_date?: string;
    phone?: string;
    degree?: string;
    academic_rank?: string;
    avt?: string;
}

