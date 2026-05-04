import { AccessAction, AccessResult } from './access-log.entity';
export declare class CreateAccessLogDto {
    user_id?: number;
    session_id?: string;
    ip_address?: string;
    user_agent?: string;
    url?: string;
    method?: string;
    action?: AccessAction;
    device_type?: string;
    device_id?: number;
    parameters?: any;
    response_code?: number;
    response_time?: number;
    result?: AccessResult;
    error_message?: string;
    referrer?: string;
}
