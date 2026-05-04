import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './auth.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(dto: LoginDto): Promise<{
        success: boolean;
        message: string;
        data: {
            token: string;
            user: Partial<import("../users/user.entity").User>;
        };
    }>;
    register(dto: RegisterDto): Promise<{
        success: boolean;
        message: string;
        data: {
            token: string;
            user: Partial<import("../users/user.entity").User>;
        };
    }>;
    logout(req: any): Promise<{
        success: boolean;
        message: string;
    }>;
    me(req: any): Promise<{
        success: boolean;
        data: any;
    }>;
}
