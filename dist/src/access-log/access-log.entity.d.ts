import { User } from '../users/user.entity';
export declare enum AccessResult {
    SUCCESS = "success",
    FAILED = "failed",
    DENIED = "denied"
}
export declare enum AccessAction {
    LOGIN = "login",
    LOGOUT = "logout",
    VIEW = "view",
    CREATE = "create",
    UPDATE = "update",
    DELETE = "delete",
    BACKUP = "backup",
    RESTORE = "restore",
    EXPORT = "export"
}
export declare class AccessLog {
    id: number;
    user_id: number;
    session_id: string;
    ip_address: string;
    user_agent: string;
    url: string;
    method: string;
    action: AccessAction;
    device_type: string;
    device_id: number;
    parameters: any;
    response_code: number;
    response_time: number;
    result: AccessResult;
    error_message: string;
    referrer: string;
    country: string;
    city: string;
    latitude: number;
    longitude: number;
    isp: string;
    browser: string;
    platform: string;
    device_family: string;
    created_at: Date;
    updated_at: Date;
    user: User;
}
