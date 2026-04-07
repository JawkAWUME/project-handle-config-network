import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

export enum AccessResult {
  SUCCESS = 'success',
  FAILED = 'failed',
  DENIED = 'denied',
}

export enum AccessAction {
  LOGIN = 'login',
  LOGOUT = 'logout',
  VIEW = 'view',
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  BACKUP = 'backup',
  RESTORE = 'restore',
  EXPORT = 'export',
}

@Entity('access_logs')
export class AccessLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: true })
  user_id: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  session_id: string;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ip_address: string;

  @Column({ type: 'text', nullable: true })
  user_agent: string;

  @Column({ type: 'text', nullable: true })
  url: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  method: string;

  @Column({ type: 'enum', enum: AccessAction, nullable: true })
  action: AccessAction;

  @Column({ type: 'varchar', length: 50, nullable: true })
  device_type: string; // polymorphic: 'SwitchModel', 'Router', 'Firewall'

  @Column({ type: 'int', nullable: true })
  device_id: number;

  @Column({ type: 'json', nullable: true })
  parameters: any;

  @Column({ type: 'int', nullable: true })
  response_code: number;

  @Column({ type: 'float', nullable: true })
  response_time: number;

  @Column({ type: 'enum', enum: AccessResult, nullable: true })
  result: AccessResult;

  @Column({ type: 'text', nullable: true })
  error_message: string;

  @Column({ type: 'text', nullable: true })
  referrer: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  country: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city: string;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  isp: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  browser: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  platform: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  device_family: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  // ✅ Relation ManyToOne avec User
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}