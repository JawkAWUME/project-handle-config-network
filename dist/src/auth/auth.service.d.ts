import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/user.entity';
import { LoginDto, RegisterDto } from './auth.dto';
export declare class AuthService {
    private usersRepository;
    private jwtService;
    constructor(usersRepository: Repository<User>, jwtService: JwtService);
    login(dto: LoginDto): Promise<{
        token: string;
        user: Partial<User>;
    }>;
    register(dto: RegisterDto): Promise<{
        token: string;
        user: Partial<User>;
    }>;
    validateUser(id: number): Promise<User | null>;
}
