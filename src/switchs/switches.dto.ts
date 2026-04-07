import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSwitchDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  site_id?: number;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsString()
  firmware_version?: string;

  @IsOptional()
  @IsString()
  serial_number?: string;

  @IsOptional()
  @IsString()
  asset_tag?: string;

  @IsOptional()
  @IsString()
  ip_nms?: string;

  @IsOptional()
  @IsString()
  ip_service?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(4094)
  vlan_nms?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(4094)
  vlan_service?: number;

  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsInt()
  ports_total?: number;

  @IsOptional()
  @IsInt()
  ports_used?: number;

  @IsOptional()
  @IsString()
  configuration?: string;

  @IsOptional()
  @IsBoolean()
  status?: boolean;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateSwitchDto extends CreateSwitchDto {}

export class SwitchQueryDto {
  search?: string;
  status?: string;
  brand?: string;
  site_id?: number;
  limit?: number;
}