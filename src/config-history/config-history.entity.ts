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

export enum DeviceType {
  FIREWALL = 'firewall',
  ROUTER = 'router',
  SWITCH = 'switch',
}

export enum ChangeType {
  CREATE = 'create',
  UPDATE = 'update',
  BACKUP = 'backup',
  RESTORE = 'restore',
  AUTO_BACKUP = 'auto_backup',
  MANUAL_BACKUP = 'manual_backup',
}

@Entity('configuration_histories')
export class ConfigurationHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  device_type: string; // polymorphic

  @Column({ type: 'int', nullable: true })
  device_id: number;

  @Column({ type: 'text', nullable: true })
  configuration: string;

  @Column({ type: 'text', nullable: true })
  configuration_file: string;

  @Column({ type: 'int', nullable: true })
  config_size: number;

  @Column({ type: 'varchar', length: 64, nullable: true })
  config_checksum: string;

  @Column({ type: 'int', nullable: true })
  user_id: number;

  @Column({ type: 'enum', enum: ChangeType, nullable: true })
  change_type: ChangeType;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'int', nullable: true })
  restored_from: number; // id of another ConfigurationHistory

  @Column({ type: 'varchar', length: 45, nullable: true })
  ip_address: string;

  @Column({ type: 'text', nullable: true })
  change_summary: string;

  @Column({ type: 'text', nullable: true })
  pre_change_config: string;

  @Column({ type: 'text', nullable: true })
  post_change_config: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => ConfigurationHistory, { nullable: true })
  @JoinColumn({ name: 'restored_from' })
  restoredFrom: ConfigurationHistory;
}