import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Site } from '../sites/site.entity';
import { User } from '../users/user.entity';


export enum EquipmentStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  WARNING = 'warning',
  DANGER = 'danger'
}

// export enum ConnectionType {
//   FH = 'fh',
//   FO = 'fo',
//   BOTH = 'both'
// }

@Entity('switches')
export class Switch {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'int', nullable: true })
  site_id!: number;

  @Column({ type: 'int', nullable: true })
  user_id!: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  brand!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  model!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  firmware_version!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  serial_number!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  asset_tag!: string;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ip_nms!: string;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ip_service!: string;

  @Column({ type: 'int', nullable: true })
  vlan_nms!: number;

  @Column({ type: 'int', nullable: true })
  vlan_service!: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  username!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  password!: string; // encrypted

  @Column({ type: 'int', default: 0 })
  ports_total!: number;

  @Column({ type: 'int', default: 0 })
  ports_used!: number;

  @Column({ type: 'text', nullable: true })
  port_config!: string;

  @Column({ type: 'text', nullable: true })
  configuration!: string;

  @Column({ type: 'timestamp', nullable: true })
  last_backup!: Date;

  @Column({ type: 'enum', enum: EquipmentStatus, default: EquipmentStatus.ACTIVE })
  status!: EquipmentStatus;
   
  // @Column({ type: 'enum', enum: ConnectionType, nullable: true })
  // connection_type!: ConnectionType;

  @Column({ type: 'text', nullable: true })
  notes!: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at!: Date;

  @ManyToOne(() => Site)
  @JoinColumn({ name: 'site_id' })
  site!: Site;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user!: User;
}