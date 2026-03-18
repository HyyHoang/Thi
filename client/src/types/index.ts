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
    id: number;
    username: string;
    email: string;
    role: number; // 0 = admin, 1 = normal user
}

// =====================
// Institute
// =====================
export interface Institute {
    institute_id: number;
    institute_name: string;
    description?: string;
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
