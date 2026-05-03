import {
  IsString, IsNotEmpty, IsOptional, IsInt, Min, Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Column } from 'typeorm';
import { EquipmentStatus, ConnectionType } from './switch.entity';

export class CreateSwitchDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional() @IsInt() @Type(() => Number)
  site_id?: number;

  @IsOptional() @IsString() brand?: string;
  @IsOptional() @IsString() model?: string;
  @IsOptional() @IsString() firmware_version?: string;
  @IsOptional() @IsString() serial_number?: string;
  @IsOptional() @IsString() asset_tag?: string;
  @IsOptional() @IsString() ip_nms?: string;
  @IsOptional() @IsString() ip_service?: string;

  @IsOptional() @IsInt() @Min(1) @Max(4094) @Type(() => Number)
  vlan_nms?: number;

  @IsOptional() @IsInt() @Min(1) @Max(4094) @Type(() => Number)
  vlan_service?: number;

  @IsOptional() @IsString() username?: string;
  @IsOptional() @IsString() password?: string;

  @IsOptional() @IsInt() @Type(() => Number) ports_total?: number;
  @IsOptional() @IsInt() @Type(() => Number) ports_used?: number;

  @IsOptional() @IsString() configuration?: string;

  // ✅ STRING — valeurs attendues : 'active' | 'danger' | 'warning'
  // ❌ NE PAS utiliser @IsBoolean() : le frontend envoie des strings
  @Column({ type: 'enum', enum: EquipmentStatus, default: EquipmentStatus.ACTIVE })
  status!: EquipmentStatus;

   @Column({ type: 'enum', enum: ConnectionType, nullable: true })
  connection_type!: ConnectionType;

  @IsOptional() @IsString() notes?: string;
}

export class UpdateSwitchDto extends CreateSwitchDto {}

export class SwitchQueryDto {
  search?: string;
  status?: 'active' | 'inactive' | 'warning' | 'danger' | 'all';
  brand?: string;
  site_id?: number;
  limit?: number;
}