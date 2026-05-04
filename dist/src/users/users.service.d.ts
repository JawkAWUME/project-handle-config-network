import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto, UpdateUserDto } from './users.dto';
export declare class UsersService {
    private usersRepository;
    constructor(usersRepository: Repository<User>);
    findAll(): Promise<Partial<User>[]>;
    create(dto: CreateUserDto, requestingUser: any): Promise<User>;
    update(id: number, dto: UpdateUserDto, requestingUser: any): Promise<User>;
    remove(id: number, requestingUser: any): Promise<void>;
    toggleStatus(id: number, requestingUser: any): Promise<User>;
}
