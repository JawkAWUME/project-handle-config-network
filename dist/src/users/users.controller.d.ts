import { CreateUserDto, UpdateUserDto } from './users.dto';
import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    index(): Promise<{
        success: boolean;
        data: Partial<import("./user.entity").User>[];
    }>;
    store(dto: CreateUserDto, req: any): Promise<{
        success: boolean;
        message: string;
        data: import("./user.entity").User;
    }>;
    update(id: number, dto: UpdateUserDto, req: any): Promise<{
        success: boolean;
        message: string;
        data: import("./user.entity").User;
    }>;
    destroy(id: number, req: any): Promise<{
        success: boolean;
        message: string;
    }>;
    toggleStatus(id: number, req: any): Promise<{
        success: boolean;
        message: string;
        data: import("./user.entity").User;
    }>;
}
