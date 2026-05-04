import { Site } from '../sites/site.entity';
import { User } from '../users/user.entity';
export declare enum FirewallType {
    PALO_ALTO = "palo_alto",
    FORTINET = "fortinet",
    CHECKPOINT = "checkpoint",
    CISCO_ASA = "cisco_asa",
    OTHER = "other"
}
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
export declare class Firewall {
    id: number;
    name: string;
    site_id: number;
    site: Site;
    user_id: number;
    user: User;
    firewall_type: FirewallType;
    brand: string;
    model: string;
    ip_nms: string;
    ip_service: string;
    vlan_nms: number;
    vlan_service: number;
    username: string;
    password: string;
    enable_password: string;
    configuration: string;
    configuration_file: string;
    security_policies: object[];
    nat_rules: object[];
    vpn_configuration: object;
    licenses: object[];
    firmware_version: string;
    serial_number: string;
    asset_tag: string;
    status: EquipmentStatus;
    connection_type: ConnectionType;
    high_availability: boolean;
    ha_peer_id: number;
    monitoring_enabled: boolean;
    last_backup: Date;
    security_policies_count: number;
    cpu: number;
    memory: number;
    notes: string;
    created_at: Date;
    updated_at: Date;
    get fullName(): string;
    get haStatus(): {
        status: string;
        message: string;
    };
    checkLicenses(): {
        status: string;
        message: string;
    };
}
