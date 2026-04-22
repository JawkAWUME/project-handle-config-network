import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne,
  CreateDateColumn, UpdateDateColumn, JoinColumn,
} from 'typeorm';
import { Site } from '../sites/site.entity';
import { User } from '../users/user.entity';

@Entity('switches')
export class Switch {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  site_id: number;

  @ManyToOne(() => Site, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'site_id' })
  site: Site;

  @Column({ nullable: true })
  user_id: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ nullable: true }) brand: string;
  @Column({ nullable: true }) model: string;
  @Column({ nullable: true }) firmware_version: string;
  @Column({ nullable: true }) serial_number: string;
  @Column({ nullable: true }) asset_tag: string;

  @Column({ nullable: true }) ip_nms: string;
  @Column({ nullable: true }) ip_service: string;
  @Column({ nullable: true }) vlan_nms: number;
  @Column({ nullable: true }) vlan_service: number;

  @Column({ nullable: true }) username: string;
  @Column({ nullable: true }) password: string;

  @Column({ nullable: true }) ports_total: number;
  @Column({ nullable: true }) ports_used: number;
  @Column({ type: 'text', nullable: true }) configuration: string;
  @Column({ type: 'text', nullable: true }) port_config: string;

  // ✅ STRING — 'active' | 'danger' | 'warning'
  // ❌ PAS boolean : le frontend et les DTO utilisent tous des strings
  @Column({ type: 'varchar', length: 20, default: 'active' })
  status: string;

  @Column({ type: 'text', nullable: true }) notes: string;

  @Column({ nullable: true }) last_backup: Date;
  @Column({ nullable: true }) last_access_user: string;
  @Column({ nullable: true }) last_access_time: Date;

  @Column({ default: false }) monitoring_enabled: boolean;
  @Column({ default: false }) poe_enabled: boolean;

  @CreateDateColumn() created_at: Date;
  @UpdateDateColumn() updated_at: Date;
}