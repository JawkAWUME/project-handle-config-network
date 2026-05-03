import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
  OneToMany,
} from 'typeorm';
import { Exclude } from 'class-transformer';

export enum UserRole {
  ADMIN = 'admin',
  AGENT = 'agent',
  VIEWER = 'viewer',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  @Exclude() // hidden dans les réponses (équivalent $hidden Laravel)
  password!: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.VIEWER })
  role!: UserRole;

  @Column({ nullable: true })
  department!: string;

  @Column({ nullable: true })
  phone!: string;

  @Column({ default: true })
  is_active!: boolean;

  @Column({ nullable: true })
  email_verified_at!: Date;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  // Helpers (équivalent des méthodes du model Laravel)
  hasRole(role: UserRole): boolean {
    return this.role === role;
  }

  isAdmin(): boolean {
    return this.role === UserRole.ADMIN;
  }

  hasAnyRole(roles: UserRole[]): boolean {
    return roles.includes(this.role);
  }
}
