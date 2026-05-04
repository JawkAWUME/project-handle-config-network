import { EquipmentStatus, ConnectionType } from './switch.entity';
export declare class CreateSwitchDto {
    name: string;
    site_id?: number;
    brand?: string;
    model?: string;
    firmware_version?: string;
    serial_number?: string;
    asset_tag?: string;
    ip_nms?: string;
    ip_service?: string;
    vlan_nms?: number;
    vlan_service?: number;
    username?: string;
    password?: string;
    ports_total?: number;
    ports_used?: number;
    configuration?: string;
    status: EquipmentStatus;
    connection_type: ConnectionType;
    notes?: string;
}
export declare class UpdateSwitchDto extends CreateSwitchDto {
}
export declare class SwitchQueryDto {
    search?: string;
    status?: EquipmentStatus;
    connection_type?: ConnectionType;
    brand?: string;
    site_id?: number;
    limit?: number;
}
