import { User } from '../users/user.entity';
export type PendingEntityType = 'firewall' | 'router' | 'switch' | 'site';
export type ChangeAction = 'update' | 'delete' | 'create';
export declare class PendingChange {
    id: number;
    entity_type: PendingEntityType;
    entity_id: number;
    action: ChangeAction;
    new_data: Record<string, any>;
    old_data: Record<string, any>;
    requested_by: User;
    requested_by_id: number;
    status: 'pending' | 'approved' | 'rejected';
    created_at: Date;
    reviewed_at: Date;
    reviewed_by: User;
    reviewed_by_id: number;
    rejection_reason: string;
}
