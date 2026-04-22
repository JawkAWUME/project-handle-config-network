import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsInt,
  Min,
  Max,
  IsObject,
  IsArray,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateRouterDto {
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
  @IsObject()
  interfaces?: any;

  @IsOptional()
  @IsInt()
  interfaces_count?: number;

  @IsOptional()
  @IsInt()
  interfaces_up_count?: number;

  @IsOptional()
  @IsArray()
  routing_protocols?: string[];

  @IsOptional()
  @IsString()
  management_ip?: string;

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
  @IsString()
  enable_password?: string;

  @IsOptional()
  @IsString()
  operating_system?: string;

  @IsOptional()
  @IsString()
  serial_number?: string;

  @IsOptional()
  @IsString()
  asset_tag?: string;

  @IsOptional()
  @IsBoolean()
  status?: string;

  @IsOptional()
  @IsString()
  configuration?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateRouterDto extends CreateRouterDto {}

export class RouterQueryDto {
  search?: string;
  status?: string;
  brand?: string;
  site_id?: number;
  limit?: number;
}