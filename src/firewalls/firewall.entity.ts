import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Site } from '../sites/site.entity';
import { User } from '../users/user.entity';

export enum FirewallType {
  PALO_ALTO = 'palo_alto',
  FORTINET = 'fortinet',
  CHECKPOINT = 'checkpoint',
  CISCO_ASA = 'cisco_asa',
  OTHER = 'other',
}

@Entity('firewalls')
export class Firewall {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  site_id: number;

  @ManyToOne(() => Site, { nullable: true, eager: false })
  @JoinColumn({ name: 'site_id' })
  site: Site;

  @Column({ nullable: true })
  user_id: number;

  @ManyToOne(() => User, { nullable: true, eager: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'enum', enum: FirewallType, nullable: true })
  firewall_type: FirewallType;

  @Column({ nullable: true })
  brand: string;

  @Column({ nullable: true })
  model: string;

  @Column({ nullable: true })
  ip_nms: string;

  @Column({ nullable: true })
  ip_service: string;

  @Column({ nullable: true })
  vlan_nms: number;

  @Column({ nullable: true })
  vlan_service: number;

  @Column({ nullable: true })
  username: string;

  @Column({ nullable: true })
  password: string;

  @Column({ nullable: true })
  @Exclude()
  enable_password: string;

  @Column({ nullable: true, type: 'text' })
  configuration: string;

  @Column({ nullable: true, type: 'text' })
  configuration_file: string;

  @Column({ nullable: true, type: 'json' })
  security_policies: object[];

  @Column({ nullable: true, type: 'json' })
  nat_rules: object[];

  @Column({ nullable: true, type: 'json' })
  @Exclude()
  vpn_configuration: object;

  @Column({ nullable: true, type: 'json' })
  licenses: object[];

  @Column({ nullable: true })
  firmware_version: string;

  @Column({ nullable: true })
  serial_number: string;

  @Column({ nullable: true })
  asset_tag: string;

  @Column({ default: true })
  status: boolean;

  @Column({ default: false })
  high_availability: boolean;

  @Column({ nullable: true })
  ha_peer_id: number;

  @Column({ default: false })
  monitoring_enabled: boolean;

  @Column({ nullable: true, type: 'timestamp' })
  last_backup: Date;

  @Column({ nullable: true })
  security_policies_count: number;

  @Column({ nullable: true })
  cpu: number;

  @Column({ nullable: true })
  memory: number;

  @Column({ nullable: true, type: 'text' })
  notes: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Helpers (équivalent des accesseurs/méthodes du Model Laravel)
  get fullName(): string {
    return `${this.name} (${this.brand} ${this.model})`;
  }

  get haStatus(): { status: string; message: string } {
    if (!this.high_availability) {
      return { status: 'secondary', message: 'Non configuré' };
    }
    return { status: 'success', message: 'Actif' };
  }

  checkLicenses(): { status: string; message: string } {
    if (!this.licenses?.length) {
      return { status: 'warning', message: 'Aucune licence configurée' };
    }
    const now = new Date();
    let expired = 0, expiring = 0, valid = 0;
    for (const lic of this.licenses as any[]) {
      if (lic.expiration_date) {
        const exp = new Date(lic.expiration_date);
        const days = (exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
        if (days < 0) expired++;
        else if (days <= 30) expiring++;
        else valid++;
      }
    }
    if (expired > 0) return { status: 'danger', message: `${expired} licence(s) expirée(s)` };
    if (expiring > 0) return { status: 'warning', message: `${expiring} licence(s) expirent bientôt` };
    return { status: 'success', message: 'Toutes les licences sont valides' };
  }
}
