import { User } from '../users/user.entity';
export declare enum DeviceType {
    FIREWALL = "firewall",
    ROUTER = "router",
    SWITCH = "switch"
}
export declare enum ChangeType {
    CREATE = "create",
    UPDATE = "update",
    BACKUP = "backup",
    RESTORE = "restore",
    AUTO_BACKUP = "auto_backup",
    MANUAL_BACKUP = "manual_backup"
}
export declare class ConfigurationHistory {
    id: number;
    device_type: string;
    device_id: number;
    configuration: string;
    configuration_file: string;
    config_size: number;
    config_checksum: string;
    user_id: number;
    change_type: ChangeType;
    notes: string;
    restored_from: number;
    ip_address: string;
    change_summary: string;
    pre_change_config: string;
    post_change_config: string;
    created_at: Date;
    updated_at: Date;
    user: User;
    restoredFrom: ConfigurationHistory;
}
