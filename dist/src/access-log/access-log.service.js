"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccessLogsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const access_log_entity_1 = require("./access-log.entity");
const geoip = __importStar(require("geoip-lite"));
let AccessLogsService = class AccessLogsService {
    accessLogRepository;
    constructor(accessLogRepository) {
        this.accessLogRepository = accessLogRepository;
    }
    async create(dto, req) {
        const forwarded = req.headers['x-forwarded-for'];
        const ip = forwarded ? forwarded.split(',')[0].trim() : req.ip;
        const enriched = {
            ...dto,
            ip_address: ip,
            user_agent: req.headers['user-agent'],
            url: req.url,
            method: req.method,
            referrer: req.headers.referer || req.headers.referrer,
        };
        if (enriched.ip_address && !['127.0.0.1', '::1'].includes(enriched.ip_address)) {
            try {
                const geo = geoip.lookup(enriched.ip_address);
                if (geo) {
                    enriched.country = geo.country;
                    enriched.city = geo.city;
                    enriched.latitude = geo.ll[0];
                    enriched.longitude = geo.ll[1];
                }
            }
            catch (err) {
            }
        }
        if (enriched.user_agent) {
            const ua = enriched.user_agent;
            if (ua.includes('Chrome') && !ua.includes('Edg')) {
                enriched.browser = 'Chrome';
            }
            else if (ua.includes('Firefox')) {
                enriched.browser = 'Firefox';
            }
            else if (ua.includes('Safari') && !ua.includes('Chrome')) {
                enriched.browser = 'Safari';
            }
            else if (ua.includes('Edg') || ua.includes('Edge')) {
                enriched.browser = 'Edge';
            }
            else {
                enriched.browser = 'Autre';
            }
            if (ua.includes('Windows')) {
                enriched.platform = 'Windows';
            }
            else if (ua.includes('Mac')) {
                enriched.platform = 'macOS';
            }
            else if (ua.includes('Linux')) {
                enriched.platform = 'Linux';
            }
            else if (ua.includes('Android')) {
                enriched.platform = 'Android';
            }
            else if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) {
                enriched.platform = 'iOS';
            }
            else {
                enriched.platform = 'Autre';
            }
            if (ua.includes('Mobile')) {
                enriched.device_family = 'mobile';
            }
            else if (ua.includes('Tablet')) {
                enriched.device_family = 'tablet';
            }
            else {
                enriched.device_family = 'desktop';
            }
        }
        const log = this.accessLogRepository.create(enriched);
        const saved = await this.accessLogRepository.save(log);
        return Array.isArray(saved) ? saved[0] : saved;
    }
    async findSuccessful() {
        return this.accessLogRepository.find({ where: { result: access_log_entity_1.AccessResult.SUCCESS }, relations: ['user'] });
    }
    async findFailed() {
        return this.accessLogRepository.find({ where: { result: access_log_entity_1.AccessResult.FAILED }, relations: ['user'] });
    }
    async findDenied() {
        return this.accessLogRepository.find({ where: { result: access_log_entity_1.AccessResult.DENIED }, relations: ['user'] });
    }
    async findByUser(userId) {
        return this.accessLogRepository.find({ where: { user_id: userId }, relations: ['user'] });
    }
    async findByIp(ip) {
        return this.accessLogRepository.find({ where: { ip_address: ip }, relations: ['user'] });
    }
    async findByDateRange(startDate, endDate) {
        return this.accessLogRepository.find({
            where: { created_at: (0, typeorm_2.Between)(startDate, endDate) },
            relations: ['user'],
        });
    }
    async findByAction(action) {
        return this.accessLogRepository.find({ where: { action }, relations: ['user'] });
    }
    async findSuspicious() {
        return this.accessLogRepository
            .createQueryBuilder('log')
            .leftJoinAndSelect('log.user', 'user')
            .where('log.result = :denied OR log.result = :failed OR log.response_code >= 400', {
            denied: access_log_entity_1.AccessResult.DENIED,
            failed: access_log_entity_1.AccessResult.FAILED,
        })
            .getMany();
    }
    isSuspicious(log) {
        if (log.action === access_log_entity_1.AccessAction.LOGIN && log.result === access_log_entity_1.AccessResult.FAILED)
            return true;
        if (log.result === access_log_entity_1.AccessResult.DENIED)
            return true;
        const suspiciousIps = ['185.220.100.', '10.', '172.16.', '192.168.'];
        if (suspiciousIps.some((prefix) => log.ip_address?.startsWith(prefix)))
            return true;
        return false;
    }
};
exports.AccessLogsService = AccessLogsService;
exports.AccessLogsService = AccessLogsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(access_log_entity_1.AccessLog)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], AccessLogsService);
//# sourceMappingURL=access-log.service.js.map