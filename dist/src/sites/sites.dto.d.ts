import { ConnectionType } from './site.entity';
export declare class CreateSiteDto {
    name: string;
    code?: string;
    address?: string;
    city?: string;
    country?: string;
    postal_code?: string;
    phone?: string;
    technical_contact?: string;
    technical_email?: string;
    description?: string;
    status?: string;
    capacity?: number;
    notes?: string;
    latitude?: number;
    longitude?: number;
    connection_type?: ConnectionType;
}
export declare class UpdateSiteDto extends CreateSiteDto {
}
export declare class SearchSiteDto {
    search?: string;
    status?: string;
    city?: string;
    country?: string;
    limit?: number;
}
