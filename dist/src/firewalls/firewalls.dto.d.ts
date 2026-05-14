import { EquipmentStatus } from './firewall.entity';
export declare class CreateFirewallDto {
    name: string;
    site_id?: number;
    brand?: string;
    model?: string;
    firewall_type?: string;
    ip_nms?: string;
    ip_service?: string;
    vlan_nms?: number;
    vlan_service?: number;
    username?: string;
    password?: string;
    enable_password?: string;
    firmware_version?: string;
    serial_number?: string;
    asset_tag?: string;
    security_policies_count?: number;
    cpu?: number;
    memory?: number;
    high_availability?: boolean;
    monitoring_enabled?: boolean;
    status?: EquipmentStatus;
    configuration?: string;
    notes?: string;
}
export declare class UpdateFirewallDto extends CreateFirewallDto {
}
export declare class FirewallQueryDto {
    search?: string;
    status?: string;
    brand?: string;
    site_id?: number;
    firewall_type?: string;
    limit?: number;
}
