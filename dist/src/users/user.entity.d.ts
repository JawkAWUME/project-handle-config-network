export declare enum UserRole {
    ADMIN = "admin",
    AGENT = "agent",
    VIEWER = "viewer"
}
export declare class User {
    id: number;
    name: string;
    email: string;
    password: string;
    role: UserRole;
    department: string;
    phone: string;
    is_active: boolean;
    email_verified_at: Date;
    created_at: Date;
    updated_at: Date;
    hasRole(role: UserRole): boolean;
    isAdmin(): boolean;
    hasAnyRole(roles: UserRole[]): boolean;
}
