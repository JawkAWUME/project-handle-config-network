import {
  IsString, IsNotEmpty, IsOptional, IsBoolean, IsNumber,
  IsIn, IsInt, Min, Max,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EquipmentStatus, ConnectionType } from './firewall.entity';

export class CreateFirewallDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional() @IsInt() @Type(() => Number) site_id?: number;
  @IsOptional() @IsString() brand?: string;
  @IsOptional() @IsString() model?: string;

  @IsOptional()
  @IsIn(['palo_alto', 'fortinet', 'cisco_asa', 'checkpoint', 'other'])
  firewall_type?: string;

  @IsOptional() @IsString() ip_nms?: string;
  @IsOptional() @IsString() ip_service?: string;
  @IsOptional() @IsInt() @Min(1) @Max(4094) @Type(() => Number) vlan_nms?: number;
  @IsOptional() @IsInt() @Min(1) @Max(4094) @Type(() => Number) vlan_service?: number;
  @IsOptional() @IsString() username?: string;
  @IsOptional() @IsString() password?: string;
  @IsOptional() @IsString() enable_password?: string;
  @IsOptional() @IsString() firmware_version?: string;
  @IsOptional() @IsString() serial_number?: string;
  @IsOptional() @IsString() asset_tag?: string;
  @IsOptional() @IsInt() @Min(0) @Type(() => Number) security_policies_count?: number;
  @IsOptional() @IsInt() @Min(0) @Max(100) @Type(() => Number) cpu?: number;
  @IsOptional() @IsInt() @Min(0) @Max(100) @Type(() => Number) memory?: number;
  @IsOptional() @IsBoolean() high_availability?: boolean;
  @IsOptional() @IsBoolean() monitoring_enabled?: boolean;

  @IsOptional()
  @IsEnum(EquipmentStatus)
  status?: EquipmentStatus;

  @IsOptional()
  @IsEnum(ConnectionType)
  connection_type?: ConnectionType;

  @IsOptional() @IsString() configuration?: string;
  @IsOptional() @IsString() notes?: string;
}

export class UpdateFirewallDto extends CreateFirewallDto {}

export class FirewallQueryDto {
  search?: string;
  status?: string;
  brand?: string;
  site_id?: number;
  firewall_type?: string;
  limit?: number;
}