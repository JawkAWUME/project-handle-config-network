import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserRole } from './user.entity';
import { CreateUserDto, UpdateUserDto } from './users.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  // Équivalent AuthController::indexUsers()
  async findAll(): Promise<Partial<User>[]> {
    const users = await this.usersRepository.find({
      select: ['id', 'name', 'email', 'role', 'department', 'phone', 'is_active', 'created_at'],
      order: { name: 'ASC' },
    });
    return users;
  }

  // Équivalent AuthController::storeUser()
  async create(dto: CreateUserDto, requestingUser: any): Promise<User> {
    // Seul un admin peut créer des utilisateurs (équivalent UserPolicy)
    if (requestingUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Seul un admin peut créer des utilisateurs.');
    }

    const existing = await this.usersRepository.findOne({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('Cet email est déjà utilisé.');
    }

    const hashed = await bcrypt.hash(dto.password, 12);
    const user = this.usersRepository.create({
      ...dto,
      password: hashed,
      role: dto.role as UserRole,
      is_active: true,
    });

    return this.usersRepository.save(user);
  }

  // Équivalent AuthController::updateUser()
  async update(id: number, dto: UpdateUserDto, requestingUser: any): Promise<User> {
    if (requestingUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Seul un admin peut modifier des utilisateurs.');
    }

    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Utilisateur introuvable.');

    if (dto.email && dto.email !== user.email) {
      const existing = await this.usersRepository.findOne({ where: { email: dto.email } });
      if (existing) throw new ConflictException('Cet email est déjà utilisé.');
    }

    if (dto.password) {
      dto.password = await bcrypt.hash(dto.password, 12);
    }

    Object.assign(user, dto);
    return this.usersRepository.save(user);
  }

  // Équivalent AuthController::destroyUser()
  async remove(id: number, requestingUser: any): Promise<void> {
    if (requestingUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Seul un admin peut supprimer des utilisateurs.');
    }
    if (requestingUser.sub === id) {
      throw new ForbiddenException('Vous ne pouvez pas supprimer votre propre compte.');
    }
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Utilisateur introuvable.');
    await this.usersRepository.remove(user);
  }

  // Équivalent AuthController::toggleUserStatus()
  async toggleStatus(id: number, requestingUser: any): Promise<User> {
    if (requestingUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Seul un admin peut changer le statut des utilisateurs.');
    }
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Utilisateur introuvable.');
    user.is_active = !user.is_active;
    return this.usersRepository.save(user);
  }
}