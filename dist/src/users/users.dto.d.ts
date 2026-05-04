export declare class CreateUserDto {
    name: string;
    email: string;
    password: string;
    role: string;
    department?: string;
    phone?: string;
}
export declare class UpdateUserDto {
    name?: string;
    email?: string;
    password?: string;
    role?: string;
    department?: string;
    phone?: string;
    is_active?: boolean;
}
