import type { Response } from 'express';
import { SitesService } from './sites.service';
import { CreateSiteDto, UpdateSiteDto, SearchSiteDto } from './sites.dto';
import { PendingChangeService } from '../pending-change/pending-changes.service';
export declare class SitesController {
    private readonly sitesService;
    private readonly pendingChangeService;
    constructor(sitesService: SitesService, pendingChangeService: PendingChangeService);
    getSites(query: SearchSiteDto): Promise<{
        timestamp: string;
        data: import("./site.entity").Site[];
        total: number;
        success: boolean;
    }>;
    export(res: Response): Promise<void>;
    getSite(id: number): Promise<{
        success: boolean;
        data: import("./site.entity").Site;
        timestamp: string;
    }>;
    store(dto: CreateSiteDto, req: any): Promise<{
        success: boolean;
        message: string;
        data: import("./site.entity").Site;
    }>;
    update(id: number, dto: UpdateSiteDto, req: any): Promise<{
        success: boolean;
        message: string;
        data: import("./site.entity").Site;
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
}
