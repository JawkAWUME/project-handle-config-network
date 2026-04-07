import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Site } from './site.entity';
import { CreateSiteDto, UpdateSiteDto, SearchSiteDto } from './sites.dto';
import { UserRole } from '../users/user.entity';
import * as ExcelJS from 'exceljs';

@Injectable()
export class SitesService {
  constructor(
    @InjectRepository(Site)
    private sitesRepository: Repository<Site>,
  ) {}

  async findAll(query: SearchSiteDto): Promise<{ data: Site[]; total: number }> {
    const qb = this.sitesRepository.createQueryBuilder('site');

    if (query.search) {
      qb.where(
        'site.name ILIKE :s OR site.city ILIKE :s OR site.country ILIKE :s OR site.code ILIKE :s',
        { s: `%${query.search}%` },
      );
    }
    if (query.status && query.status !== 'all') {
      qb.andWhere('site.status = :status', { status: query.status });
    }
    if (query.city) {
      qb.andWhere('site.city ILIKE :city', { city: `%${query.city}%` });
    }
    if (query.country) {
      qb.andWhere('site.country ILIKE :country', { country: `%${query.country}%` });
    }

    qb.orderBy('site.name', 'ASC');
    if (query.limit) qb.limit(query.limit);

    const [data, total] = await qb.getManyAndCount();
    return { data, total };
  }

  async findOne(id: number): Promise<Site> {
    const site = await this.sitesRepository.findOne({ where: { id } });
    if (!site) throw new NotFoundException('Site introuvable.');
    return site;
  }

  async create(dto: CreateSiteDto, user: any): Promise<Site> {
    if (user.role === UserRole.VIEWER) {
      throw new ForbiddenException('Les viewers ne peuvent pas créer des sites.');
    }
    const site = this.sitesRepository.create(dto);
    return this.sitesRepository.save(site);
  }

  async update(id: number, dto: UpdateSiteDto, user: any): Promise<Site> {
    if (user.role === UserRole.VIEWER) {
      throw new ForbiddenException('Les viewers ne peuvent pas modifier des sites.');
    }
    const site = await this.findOne(id);
    Object.assign(site, dto);
    return this.sitesRepository.save(site);
  }

  async remove(id: number, user: any): Promise<void> {
    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Seul un admin peut supprimer des sites.');
    }
    const site = await this.findOne(id);
    await this.sitesRepository.remove(site);
  }

  // Équivalent SiteController::export() + SiteExport.php
  async exportToExcel(): Promise<Uint8Array> {
    const sites = await this.sitesRepository.find({ order: { name: 'ASC' } });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Sites');

    sheet.columns = [
      { header: 'ID', key: 'id', width: 8 },
      { header: 'Nom', key: 'name', width: 25 },
      { header: 'Code', key: 'code', width: 12 },
      { header: 'Ville', key: 'city', width: 18 },
      { header: 'Pays', key: 'country', width: 18 },
      { header: 'Adresse', key: 'address', width: 30 },
      { header: 'Contact technique', key: 'technical_contact', width: 25 },
      { header: 'Email technique', key: 'technical_email', width: 28 },
      { header: 'Téléphone', key: 'phone', width: 18 },
      { header: 'Statut', key: 'status', width: 12 },
      { header: 'Capacité', key: 'capacity', width: 12 },
      { header: 'Créé le', key: 'created_at', width: 20 },
    ];

    // Style header
    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).fill = {
      type: 'pattern', pattern: 'solid',
      fgColor: { argb: 'FF2196F3' },
    };
    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

    sites.forEach(s => {
      sheet.addRow({
        id: s.id,
        name: s.name,
        code: s.code,
        city: s.city,
        country: s.country,
        address: s.address,
        technical_contact: s.technical_contact,
        technical_email: s.technical_email,
        phone: s.phone,
        status: s.status,
        capacity: s.capacity,
        created_at: s.created_at ? new Date(s.created_at).toLocaleDateString('fr-FR') : '',
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return new Uint8Array(buffer);
  }
}