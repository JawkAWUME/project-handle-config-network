import type { Response } from 'express';
import { SwitchesService } from './switches.service';
import { CreateSwitchDto, UpdateSwitchDto, SwitchQueryDto } from './switches.dto';
import { PendingChangeService } from '../pending-change/pending-changes.service';
export declare class SwitchesController {
    private readonly switchesService;
    private readonly pendingChangeService;
    constructor(switchesService: SwitchesService, pendingChangeService: PendingChangeService);
    index(query: SwitchQueryDto): Promise<{
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
    store(dto: CreateSwitchDto, req: any): Promise<{
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
    update(id: number, dto: UpdateSwitchDto, req: any): Promise<{
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
    updatePorts(id: number, configuration: string, req: any): Promise<{
        success: boolean;
        message: string;
        data: import("./switch.entity").Switch;
    }>;
}
