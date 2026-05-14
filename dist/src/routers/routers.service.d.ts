import { Repository } from 'typeorm';
import { Router } from './router.entity';
import { CreateRouterDto, UpdateRouterDto, RouterQueryDto } from './routers.dto';
import { ConfigurationHistory } from '../config-history/config-history.entity';
export declare class RoutersService {
    private routersRepository;
    private configHistoryRepository;
    constructor(routersRepository: Repository<Router>, configHistoryRepository: Repository<ConfigurationHistory>);
    findAll(query: RouterQueryDto): Promise<{
        data: any[];
        total: number;
    }>;
    findOne(id: number): Promise<any>;
    create(dto: CreateRouterDto, user: any): Promise<any>;
    update(id: number, dto: UpdateRouterDto, user: any): Promise<any>;
    remove(id: number, user: any): Promise<void>;
    createBackup(id: number, userId: number, notes?: string): Promise<ConfigurationHistory>;
    restoreFromBackup(routerId: number, backupId: number, userId: number): Promise<ConfigurationHistory>;
    getStatistics(): Promise<any>;
    exportToExcel(): Promise<Buffer>;
    private formatRouter;
    updateInterfaces(id: number, config: string, user: any): Promise<Router>;
}
