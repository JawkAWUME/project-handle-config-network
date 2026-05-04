import type { Response } from 'express';
import { RoutersService } from './routers.service';
import { CreateRouterDto, UpdateRouterDto, RouterQueryDto } from './routers.dto';
import { PendingChangeService } from '../pending-change/pending-changes.service';
export declare class RoutersController {
    private readonly routersService;
    private readonly pendingChangeService;
    constructor(routersService: RoutersService, pendingChangeService: PendingChangeService);
    index(query: RouterQueryDto): Promise<{
        timestamp: string;
        data: any[];
        total: number;
        success: boolean;
    }>;
    export(res: Response): Promise<void>;
    statistics(): Promise<{
        success: boolean;
        data: any;
    }>;
    store(dto: CreateRouterDto, req: any): Promise<{
        success: boolean;
        message: string;
        data: any;
        pending_id?: undefined;
    } | {
        success: boolean;
        message: string;
        pending_id: number;
        data?: undefined;
    }>;
    show(id: number): Promise<{
        success: boolean;
        data: any;
    }>;
    update(id: number, dto: UpdateRouterDto, req: any): Promise<{
        success: boolean;
        message: string;
        data: any;
        pending_id?: undefined;
    } | {
        success: boolean;
        message: string;
        pending_id: number;
        data?: undefined;
    }>;
    destroy(id: number, req: any): Promise<{
        success: boolean;
        message: string;
        pending_id?: undefined;
    } | {
        success: boolean;
        message: string;
        pending_id: number;
    }>;
    backup(id: number, req: any): Promise<{
        success: boolean;
        message: string;
        data: import("../config-history/config-history.entity").ConfigurationHistory;
    }>;
    restore(id: number, backupId: number, req: any): Promise<{
        success: boolean;
        message: string;
        data: import("../config-history/config-history.entity").ConfigurationHistory;
    }>;
    updateInterfaces(id: number, interfacesConfig: string, req: any): Promise<{
        success: boolean;
        message: string;
        data: import("./router.entity").Router;
    }>;
}
