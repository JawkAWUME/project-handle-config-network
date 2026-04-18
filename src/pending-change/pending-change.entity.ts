// src/entities/pending-change.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Site } from '../sites/site.entity';
import { Firewall } from '../firewalls/firewall.entity';
import { Router } from '../routers/router.entity';
import { Switch } from '../switchs/switch.entity';

export type PendingEntityType = 'firewall' | 'router' | 'switch' | 'site';
export type ChangeAction = 'update' | 'delete' | 'create';

@Entity('pending_changes')
export class PendingChange {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: ['firewall', 'router', 'switch', 'site'] })
  entity_type: PendingEntityType;

  @Column()
  entity_id: number;

  @Column({ type: 'enum', enum: ['update', 'delete'] })
  action: ChangeAction;

  @Column({ type: 'json', nullable: true })
  new_data: Record<string, any>; // pour les mises à jour

  @Column({ type: 'json', nullable: true })
  old_data: Record<string, any>; // facultatif, pour audit

  @ManyToOne(() => User)
  @JoinColumn({ name: 'requested_by' })
  requested_by: User;
  @Column()
  requested_by_id: number;

  @Column({ default: 'pending' })
  status: 'pending' | 'approved' | 'rejected';

  @CreateDateColumn()
  created_at: Date;

  @Column({ nullable: true, type: 'timestamp' })
  reviewed_at: Date;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'reviewed_by' })
  reviewed_by: User;
  @Column({ nullable: true })
  reviewed_by_id: number;

  @Column({ nullable: true })
  rejection_reason: string;
}