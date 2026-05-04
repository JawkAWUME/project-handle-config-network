import { EquipmentStatus, ConnectionType } from './router.entity';
export declare class CreateRouterDto {
    name: string;
    site_id?: number;
    brand?: string;
    model?: string;
    interfaces?: any;
    interfaces_count?: number;
    interfaces_up_count?: number;
    routing_protocols?: string[];
    management_ip?: string;
    ip_nms?: string;
    ip_service?: string;
    vlan_nms?: number;
    vlan_service?: number;
    username?: string;
    password?: string;
    enable_password?: string;
    operating_system?: string;
    serial_number?: string;
    asset_tag?: string;
    status?: EquipmentStatus;
    connection_type?: ConnectionType;
    notes?: string;
}
export declare class UpdateRouterDto extends CreateRouterDto {
}
export declare class RouterQueryDto {
    search?: string;
    status?: string;
    brand?: string;
    site_id?: number;
    limit?: number;
}
