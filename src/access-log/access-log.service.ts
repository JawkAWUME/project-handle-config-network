import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { AccessLog, AccessResult, AccessAction } from './access-log.entity';
import { CreateAccessLogDto } from './access-log.dto';
import { Request } from 'express';
import * as geoip from 'geoip-lite';

@Injectable()
export class AccessLogsService {
  constructor(
    @InjectRepository(AccessLog)
    private accessLogRepository: Repository<AccessLog>,
  ) {}

  async create(dto: CreateAccessLogDto, req: Request): Promise<AccessLog> {
    // Récupération de l'IP réelle derrière un proxy
    const forwarded = req.headers['x-forwarded-for'] as string;
    const ip = forwarded ? forwarded.split(',')[0].trim() : req.ip;

    const enriched: any = {
      ...dto,
      ip_address: ip,
      user_agent: req.headers['user-agent'],
      url: req.url,
      method: req.method,
      referrer: req.headers.referer || req.headers.referrer,
    };

    // Géolocalisation
    if (enriched.ip_address && !['127.0.0.1', '::1'].includes(enriched.ip_address)) {
      try {
        const geo = geoip.lookup(enriched.ip_address);
        if (geo) {
          enriched.country = geo.country;
          enriched.city = geo.city;
          enriched.latitude = geo.ll[0];
          enriched.longitude = geo.ll[1];
        }
      } catch (err) {
        // Ne pas bloquer la journalisation en cas d'erreur de géolocalisation
      }
    }

    // Détection simple du navigateur et de la plateforme (sans ua-parser-js)
    if (enriched.user_agent) {
      const ua = enriched.user_agent;
      
      // Détection navigateur
      if (ua.includes('Chrome') && !ua.includes('Edg')) {
        enriched.browser = 'Chrome';
      } else if (ua.includes('Firefox')) {
        enriched.browser = 'Firefox';
      } else if (ua.includes('Safari') && !ua.includes('Chrome')) {
        enriched.browser = 'Safari';
      } else if (ua.includes('Edg') || ua.includes('Edge')) {
        enriched.browser = 'Edge';
      } else {
        enriched.browser = 'Autre';
      }

      // Détection plateforme
      if (ua.includes('Windows')) {
        enriched.platform = 'Windows';
      } else if (ua.includes('Mac')) {
        enriched.platform = 'macOS';
      } else if (ua.includes('Linux')) {
        enriched.platform = 'Linux';
      } else if (ua.includes('Android')) {
        enriched.platform = 'Android';
      } else if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) {
        enriched.platform = 'iOS';
      } else {
        enriched.platform = 'Autre';
      }

      // Détection du type d'appareil (simple)
      if (ua.includes('Mobile')) {
        enriched.device_family = 'mobile';
      } else if (ua.includes('Tablet')) {
        enriched.device_family = 'tablet';
      } else {
        enriched.device_family = 'desktop';
      }
    }

    const log = this.accessLogRepository.create(enriched);
    const saved = await this.accessLogRepository.save(log);
    return Array.isArray(saved) ? saved[0] : saved;
  }

  // Méthodes "scopes"
  async findSuccessful() {
    return this.accessLogRepository.find({ where: { result: AccessResult.SUCCESS }, relations: ['user'] });
  }

  async findFailed() {
    return this.accessLogRepository.find({ where: { result: AccessResult.FAILED }, relations: ['user'] });
  }

  async findDenied() {
    return this.accessLogRepository.find({ where: { result: AccessResult.DENIED }, relations: ['user'] });
  }

  async findByUser(userId: number) {
    return this.accessLogRepository.find({ where: { user_id: userId }, relations: ['user'] });
  }

  async findByIp(ip: string) {
    return this.accessLogRepository.find({ where: { ip_address: ip }, relations: ['user'] });
  }

  async findByDateRange(startDate: Date, endDate: Date) {
    return this.accessLogRepository.find({
      where: { created_at: Between(startDate, endDate) },
      relations: ['user'],
    });
  }

  async findByAction(action: AccessAction) {
    return this.accessLogRepository.find({ where: { action }, relations: ['user'] });
  }

  async findSuspicious() {
    return this.accessLogRepository
      .createQueryBuilder('log')
      .leftJoinAndSelect('log.user', 'user')
      .where('log.result = :denied OR log.result = :failed OR log.response_code >= 400', {
        denied: AccessResult.DENIED,
        failed: AccessResult.FAILED,
      })
      .getMany();
  }

  isSuspicious(log: AccessLog): boolean {
    if (log.action === AccessAction.LOGIN && log.result === AccessResult.FAILED) return true;
    if (log.result === AccessResult.DENIED) return true;
    const suspiciousIps = ['185.220.100.', '10.', '172.16.', '192.168.'];
    if (suspiciousIps.some((prefix) => log.ip_address?.startsWith(prefix))) return true;
    return false;
  }
}