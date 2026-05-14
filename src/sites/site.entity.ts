import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn
} from 'typeorm';

// Enum déplacé ici pour qu'il soit central
export enum ConnectionType {
  FH = 'fh',
  FO = 'fo',
  BOTH = 'both'
}

@Entity('sites')
export class Site {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ nullable: true })
  code!: string;

  @Column({ nullable: true })
  address!: string;

  @Column({ nullable: true })
  city!: string;

  @Column({ nullable: true })
  country!: string;

  @Column({ nullable: true })
  postal_code!: string;

  @Column({ nullable: true })
  phone!: string;

  @Column({ nullable: true })
  technical_contact!: string;

  @Column({ nullable: true })
  technical_email!: string;

  @Column({ nullable: true, type: 'text' })
  description!: string;

  @Column({ nullable: true })
  status!: string;

  @Column({ nullable: true })
  capacity!: number;

  @Column({ nullable: true, type: 'text' })
  notes!: string;

  @Column({ nullable: true, type: 'decimal', precision: 10, scale: 8 })
  latitude!: number;

  @Column({ nullable: true, type: 'decimal', precision: 11, scale: 8 })
  longitude!: number;

  // 🆕 Nouvelle colonne
  @Column({ type: 'enum', enum: ConnectionType, nullable: true })
  connection_type!: ConnectionType;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}