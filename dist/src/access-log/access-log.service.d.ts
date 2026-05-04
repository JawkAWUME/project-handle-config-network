import { Repository } from 'typeorm';
import { AccessLog, AccessAction } from './access-log.entity';
import { CreateAccessLogDto } from './access-log.dto';
import { Request } from 'express';
export declare class AccessLogsService {
    private accessLogRepository;
    constructor(accessLogRepository: Repository<AccessLog>);
    create(dto: CreateAccessLogDto, req: Request): Promise<AccessLog>;
    findSuccessful(): Promise<AccessLog[]>;
    findFailed(): Promise<AccessLog[]>;
    findDenied(): Promise<AccessLog[]>;
    findByUser(userId: number): Promise<AccessLog[]>;
    findByIp(ip: string): Promise<AccessLog[]>;
    findByDateRange(startDate: Date, endDate: Date): Promise<AccessLog[]>;
    findByAction(action: AccessAction): Promise<AccessLog[]>;
    findSuspicious(): Promise<AccessLog[]>;
    isSuspicious(log: AccessLog): boolean;
}
