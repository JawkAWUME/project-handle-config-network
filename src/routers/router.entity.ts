import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Site } from '../sites/site.entity';
import { User } from '../users/user.entity';


export enum EquipmentStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  WARNING = 'warning',
  DANGER = 'danger'
}

export enum ConnectionType {
  FH = 'fh',
  FO = 'fo',
  BOTH = 'both'
}

@Entity('routers')
export class Router {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ nullable: true })
  site_id!: number;

  @ManyToOne(() => Site, { nullable: true, eager: false })
  @JoinColumn({ name: 'site_id' })
  site!: Site;

  @Column({ nullable: true })
  user_id!: number;

  @ManyToOne(() => User, { nullable: true, eager: false })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ nullable: true })
  brand!: string;

  @Column({ nullable: true })
  model!: string;

  @Column({ nullable: true, type: 'json' })
  interfaces!: object[];

  @Column({ nullable: true })
  interfaces_count!: number;

  @Column({ nullable: true })
  interfaces_up_count!: number;

  @Column({ nullable: true, type: 'json' })
  routing_protocols!: string[];

  @Column({ nullable: true })
  management_ip!: string;

  @Column({ nullable: true })
  ip_nms!: string;

  @Column({ nullable: true })
  ip_service!: string;

  @Column({ nullable: true })
  vlan_nms!: number;

  @Column({ nullable: true })
  vlan_service!: number;

  @Column({ nullable: true })
  username!: string;

  @Column({ nullable: true })
  password!: string;

  @Column({ nullable: true })
  @Exclude()
  enable_password!: string;

  @Column({ nullable: true, type: 'text' })
  configuration!: string;

  @Column({ nullable: true, type: 'text' })
  configuration_file!: string;

  @Column({ nullable: true })
  operating_system!: string;

  @Column({ nullable: true })
  serial_number!: string;

  @Column({ nullable: true })
  asset_tag!: string;

  @Column({ type: 'enum', enum: EquipmentStatus, default: EquipmentStatus.ACTIVE })
    status!: EquipmentStatus;
  
  @Column({ type: 'enum', enum: ConnectionType, nullable: true })
  connection_type!: ConnectionType;

  @Column({ nullable: true, type: 'timestamp' })
  last_backup!: Date;

  @Column({ nullable: true, type: 'text' })
  notes!: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @Column({ type: 'text', nullable: true })
  interfaces_config!: string;

  get fullName(): string {
    return `${this.name} (${this.brand} ${this.model})`;
  }

  get backupStatus(): { status: string; message: string } {
    if (!this.last_backup) {
      return { status: 'warning', message: 'Jamais sauvegardé' };
    }
    const days = (Date.now() - new Date(this.last_backup).getTime()) / (1000 * 60 * 60 * 24);
    if (days <= 1) return { status: 'success', message: 'Récent (<24h)' };
    if (days <= 7) return { status: 'info', message: 'Récent (<7 jours)' };
    return { status: 'danger', message: 'Ancien (>7 jours)' };
  }
}
