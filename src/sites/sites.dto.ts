import { IsNotEmpty, IsString, IsOptional, IsNumber, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ConnectionType } from './site.entity';

export class CreateSiteDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional() @IsString() code?: string;
  @IsOptional() @IsString() address?: string;
  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsString() country?: string;
  @IsOptional() @IsString() postal_code?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() technical_contact?: string;
  @IsOptional() @IsString() technical_email?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsNumber() @Type(() => Number) capacity?: number;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsNumber() @Type(() => Number) latitude?: number;
  @IsOptional() @IsNumber() @Type(() => Number) longitude?: number;
    @IsOptional()
  @IsEnum(ConnectionType)
  connection_type?: ConnectionType;
}

export class UpdateSiteDto extends CreateSiteDto {}

export class SearchSiteDto {
  search?: string;
  status?: string;
  city?: string;
  country?: string;
  limit?: number;
}