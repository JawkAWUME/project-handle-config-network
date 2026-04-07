import {
  IsOptional,
  IsString,
  IsEnum,
  IsInt,
  IsNumber,
  IsObject,
  IsUrl,
  MaxLength,
} from 'class-validator';
import { AccessAction, AccessResult } from './access-log.entity';

export class CreateAccessLogDto {
  @IsOptional()
  @IsInt()
  user_id?: number;

  @IsOptional()
  @IsString()
  session_id?: string;

  @IsOptional()
  @IsString()
  ip_address?: string;

  @IsOptional()
  @IsString()
  user_agent?: string;

  @IsOptional()
  @IsUrl()
  url?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  method?: string;

  @IsOptional()
  @IsEnum(AccessAction)
  action?: AccessAction;

  @IsOptional()
  @IsString()
  device_type?: string;

  @IsOptional()
  @IsInt()
  device_id?: number;

  @IsOptional()
  @IsObject()
  parameters?: any;

  @IsOptional()
  @IsInt()
  response_code?: number;

  @IsOptional()
  @IsNumber()
  response_time?: number;

  @IsOptional()
  @IsEnum(AccessResult)
  result?: AccessResult;

  @IsOptional()
  @IsString()
  error_message?: string;

  @IsOptional()
  @IsUrl()
  referrer?: string;
}