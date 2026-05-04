import { PendingChangeService } from "./pending-changes.service";
export declare class PendingChangesController {
    private pendingService;
    constructor(pendingService: PendingChangeService);
    list(): Promise<{
        success: boolean;
        data: import("./pending-change.entity").PendingChange[];
    }>;
    approve(id: number, req: any): Promise<{
        success: boolean;
        message: string;
    }>;
    reject(id: number, reason: string, req: any): Promise<{
        success: boolean;
        message: string;
    }>;
}
