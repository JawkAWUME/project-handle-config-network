import { Repository } from 'typeorm';
import { Site } from './site.entity';
import { CreateSiteDto, UpdateSiteDto, SearchSiteDto } from './sites.dto';
export declare class SitesService {
    private sitesRepository;
    constructor(sitesRepository: Repository<Site>);
    findAll(query: SearchSiteDto): Promise<{
        data: Site[];
        total: number;
    }>;
    findOne(id: number): Promise<Site>;
    create(dto: CreateSiteDto, user: any): Promise<Site>;
    update(id: number, dto: UpdateSiteDto, user: any): Promise<Site>;
    remove(id: number, user: any): Promise<void>;
    exportToExcel(): Promise<Uint8Array>;
}
