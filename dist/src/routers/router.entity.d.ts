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
export declare class Router {
    id: number;
    name: string;
    site_id: number;
    site: Site;
    user_id: number;
    user: User;
    brand: string;
    model: string;
    interfaces: object[];
    interfaces_count: number;
    interfaces_up_count: number;
    routing_protocols: string[];
    management_ip: string;
    ip_nms: string;
    ip_service: string;
    vlan_nms: number;
    vlan_service: number;
    username: string;
    password: string;
    enable_password: string;
    configuration: string;
    configuration_file: string;
    operating_system: string;
    serial_number: string;
    asset_tag: string;
    status: EquipmentStatus;
    connection_type: ConnectionType;
    last_backup: Date;
    notes: string;
    created_at: Date;
    updated_at: Date;
    interfaces_config: string;
    get fullName(): string;
    get backupStatus(): {
        status: string;
        message: string;
    };
}
