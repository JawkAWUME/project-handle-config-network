import { Repository } from 'typeorm';
import { Switch } from './switch.entity';
import { CreateSwitchDto, UpdateSwitchDto, SwitchQueryDto } from './switches.dto';
import { ConfigurationHistory } from '../config-history/config-history.entity';
export declare class SwitchesService {
    private switchesRepository;
    private configHistoryRepository;
    constructor(switchesRepository: Repository<Switch>, configHistoryRepository: Repository<ConfigurationHistory>);
    findAll(query: SwitchQueryDto): Promise<{
        data: any[];
        total: number;
    }>;
    findOne(id: number): Promise<any>;
    create(dto: CreateSwitchDto, user: any): Promise<any>;
    update(id: number, dto: UpdateSwitchDto, user: any): Promise<any>;
    remove(id: number, user: any): Promise<void>;
    createBackup(id: number, userId: number, notes?: string): Promise<ConfigurationHistory>;
    getStatistics(): Promise<any>;
    exportToExcel(): Promise<Buffer>;
    private formatSwitch;
    private getConnectionTypeLabel;
    updatePorts(id: number, configuration: string, user: any): Promise<Switch>;
}
