import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { ConflictException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import bcrypt from 'node_modules/bcryptjs/umd/types';
import { User, UserRole } from 'src/users/user.entity';
import { LoginDto, RegisterDto } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async login(dto: LoginDto): Promise<{ token: string; user: Partial<User> }> {
    const cacheKey = `user:email:${dto.email}`;
    
    // Tentative de récupération depuis le cache
    let user = await this.cacheManager.get<User>(cacheKey);
    
    if (!user) {
      // Cache miss : requête en base
      const user = await this.usersRepository.findOneBy({ email: dto.email });
      if (user) {
        // Stockage en cache pour 5 minutes
        await this.cacheManager.set(cacheKey, user, 300000);
      }
    }

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

  async register(dto: RegisterDto): Promise<{ token: string; user: Partial<User> }> {
    // Vérification existence (pas besoin de cache pour cette vérification unique)
    const existing = await this.usersRepository.findOneBy({ email: dto.email });
    if (existing) {
      throw new ConflictException('Cet email est déjà utilisé.');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10); // rounds réduit à 10
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
    
    // Invalidation du cache (au cas où une entrée existerait)
    await this.cacheManager.del(`user:email:${dto.email}`);

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
    return this.usersRepository.findOneBy({ id, is_active: true });
  }
}