import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User, UserRole } from '../users/user.entity';
import { LoginDto, RegisterDto } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  // Équivalent AuthController::login()
  async login(dto: LoginDto): Promise<{ token: string; user: Partial<User> }> {
    const user = await this.usersRepository.findOneBy({ email: dto.email });

    if (!user || !user.is_active) {
      throw new UnauthorizedException('Compte inactif ou inexistant.');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Identifiants incorrects.');
    }

    const payload = { sub: user.id, email: user.email, role: user.role, name: user.name };
    const token = await this.jwtService.signAsync(payload);

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        is_active: user.is_active,
      },
    };
  }

  // Équivalent AuthController::register()
  async register(dto: RegisterDto): Promise<{ token: string; user: Partial<User> }> {
    const existing = await  this.usersRepository.findOneBy({ email: dto.email });
    if (existing) {
      throw new ConflictException('Cet email est déjà utilisé.');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = this.usersRepository.create({
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
      role: dto.role as UserRole,
      department: dto.department,
      phone: dto.phone,
      is_active: true,
    });

    await this.usersRepository.save(user);

    const payload = { sub: user.id, email: user.email, role: user.role, name: user.name };
    const token = await this.jwtService.signAsync(payload);

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async validateUser(id: number): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id, is_active: true } });
  }
}