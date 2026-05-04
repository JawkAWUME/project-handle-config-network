import { Site } from '../sites/site.entity';
import { User } from '../users/user.entity';
export declare enum EquipmentStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
    WARNING = "warning",
    DANGER = "danger"
}
export declare enum ConnectionType {
    FH = "fh",
    FO = "fo",
    BOTH = "both"
}
export declare class Switch {
    id: number;
    name: string;
    site_id: number;
    user_id: number;
    brand: string;
    model: string;
    firmware_version: string;
    serial_number: string;
    asset_tag: string;
    ip_nms: string;
    ip_service: string;
    vlan_nms: number;
    vlan_service: number;
    username: string;
    password: string;
    ports_total: number;
    ports_used: number;
    port_config: string;
    configuration: string;
    last_backup: Date;
    status: EquipmentStatus;
    connection_type: ConnectionType;
    notes: string;
    created_at: Date;
    updated_at: Date;
    site: Site;
    user: User;
}
