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
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const dotenv = __importStar(require("dotenv"));
dotenv.config({ path: `.env.${process.env.APP_ENV || 'development'}` });
const typeorm_1 = require("typeorm");
const bcrypt = __importStar(require("bcryptjs"));
const user_entity_1 = require("../users/user.entity");
const site_entity_1 = require("../sites/site.entity");
const firewall_entity_1 = require("../firewalls/firewall.entity");
const router_entity_1 = require("../routers/router.entity");
const switch_entity_1 = require("../switchs/switch.entity");
const force = process.env.SEED_FORCE === 'true';
const isProd = process.env.APP_ENV === 'production';
const AppDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    entities: [user_entity_1.User, site_entity_1.Site, firewall_entity_1.Firewall, router_entity_1.Router, switch_entity_1.Switch],
    synchronize: !isProd,
    logging: false,
    ssl: process.env.DATABASE_URL?.includes('render.com')
        ? { rejectUnauthorized: false }
        : false,
    extra: {
        max: 1,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 30000,
        keepAlive: true,
        statement_timeout: 60000,
        query_timeout: 60000,
    },
});
async function pause(ms = 300) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
async function seed() {
    console.log('🔧 DATABASE_URL =', process.env.DATABASE_URL ? '***' : 'NON DÉFINIE');
    try {
        await AppDataSource.initialize();
        console.log('✅ Connexion PostgreSQL établie');
        const userRepo = AppDataSource.getRepository(user_entity_1.User);
        const siteRepo = AppDataSource.getRepository(site_entity_1.Site);
        const fwRepo = AppDataSource.getRepository(firewall_entity_1.Firewall);
        const routerRepo = AppDataSource.getRepository(router_entity_1.Router);
        const swRepo = AppDataSource.getRepository(switch_entity_1.Switch);
        if (force) {
            console.log('🔥 Réinitialisation DB...');
            await AppDataSource.query(`
        TRUNCATE TABLE
          firewalls,
          routers,
          switches,
          users,
          sites
        RESTART IDENTITY CASCADE
      `);
            console.log('✅ Base réinitialisée');
            await pause();
        }
        if (await userRepo.count() === 0) {
            console.log('👤 Création des utilisateurs...');
            const passwordHash = await bcrypt.hash('password', 12);
            const usersData = [
                { name: 'Administrateur', email: 'admin@network.local', password: passwordHash, role: user_entity_1.UserRole.ADMIN, department: 'Informatique', is_active: true },
                { name: 'Agent Réseau', email: 'agent@network.local', password: passwordHash, role: user_entity_1.UserRole.AGENT, department: 'Réseau', is_active: true },
                { name: 'Observateur', email: 'viewer@network.local', password: passwordHash, role: user_entity_1.UserRole.VIEWER, department: 'Direction', is_active: true },
                { name: 'Support Technique', email: 'support@network.local', password: passwordHash, role: user_entity_1.UserRole.AGENT, department: 'Support', is_active: true },
                { name: 'Consultant Externe', email: 'consultant@network.local', password: passwordHash, role: user_entity_1.UserRole.VIEWER, department: 'Consulting', is_active: false },
            ];
            for (const user of usersData) {
                await userRepo.save(userRepo.create(user));
            }
            console.log('✅ Users créés (5)');
            await pause();
        }
        else
            console.log('⏭️ Users déjà présents');
        const users = await userRepo.find();
        let sites = [];
        if (await siteRepo.count() === 0) {
            console.log('🏢 Création des sites...');
            const sitesData = [
                {
                    name: 'Siège Social Dakar',
                    code: 'HQ-DKR',
                    city: 'Dakar',
                    country: 'Sénégal',
                    address: '12 Av. Léopold Sédar Senghor',
                    postal_code: '10000',
                    latitude: 14.7167,
                    longitude: -17.4677,
                    phone: '+221 33 123 45 67',
                    technical_contact: 'Admin IT',
                    technical_email: 'it@company.sn',
                    status: 'active',
                    description: 'Bâtiment principal',
                    connection_type: site_entity_1.ConnectionType.FO,
                },
                {
                    name: 'Agence Plateau',
                    code: 'AGT-PLT',
                    city: 'Dakar',
                    country: 'Sénégal',
                    address: '5 Rue Carnot',
                    postal_code: '10001',
                    latitude: 14.6833,
                    longitude: -17.4833,
                    phone: '+221 33 234 56 78',
                    technical_contact: 'Technicien A',
                    technical_email: 'tech.plateau@company.sn',
                    status: 'active',
                    connection_type: site_entity_1.ConnectionType.FH,
                },
                {
                    name: 'Agence Thiès',
                    code: 'AGT-THS',
                    city: 'Thiès',
                    country: 'Sénégal',
                    address: '10 Rue de la Gare',
                    postal_code: '21000',
                    latitude: 14.7911,
                    longitude: -16.9356,
                    phone: '+221 33 345 67 89',
                    technical_contact: 'Technicien B',
                    technical_email: 'tech.thies@company.sn',
                    status: 'active',
                    connection_type: site_entity_1.ConnectionType.FH,
                },
                {
                    name: 'DataCenter Principal',
                    code: 'DC-MAIN',
                    city: 'Dakar',
                    country: 'Sénégal',
                    address: 'Zone Industrielle',
                    postal_code: '10002',
                    latitude: 14.75,
                    longitude: -17.4,
                    status: 'active',
                    capacity: 200,
                    technical_contact: 'DBA Team',
                    technical_email: 'dba@datacenter.sn',
                    connection_type: site_entity_1.ConnectionType.BOTH,
                },
                {
                    name: 'Agence Saint-Louis',
                    code: 'AGT-SL',
                    city: 'Saint-Louis',
                    country: 'Sénégal',
                    address: '38 Avenue Faidherbe',
                    postal_code: '32000',
                    latitude: 16.0179,
                    longitude: -16.4896,
                    status: 'inactive',
                    connection_type: site_entity_1.ConnectionType.FO,
                },
            ];
            for (const site of sitesData) {
                const created = await siteRepo.save(siteRepo.create(site));
                sites.push(created);
            }
            console.log('✅ Sites créés (5)');
            await pause();
        }
        else {
            sites = await siteRepo.find();
            console.log('⏭️ Sites déjà présents');
        }
        if (await fwRepo.count() === 0) {
            console.log('🔥 Création des firewalls...');
            const firewalls = [
                {
                    name: 'FW-HQ-01',
                    site_id: sites[0].id,
                    user_id: users[0].id,
                    firewall_type: firewall_entity_1.FirewallType.FORTINET,
                    brand: 'Fortinet',
                    model: 'FortiGate 600E',
                    ip_nms: '10.0.0.1',
                    ip_service: '192.168.1.1',
                    vlan_nms: 100,
                    vlan_service: 200,
                    username: 'admin',
                    password: 'Fortinet@123',
                    firmware_version: '7.2.4',
                    serial_number: 'FT600E-001',
                    status: firewall_entity_1.EquipmentStatus.ACTIVE,
                    high_availability: true,
                    monitoring_enabled: true,
                    security_policies_count: 42,
                    cpu: 23,
                    memory: 45,
                },
                {
                    name: 'FW-DC-01',
                    site_id: sites[3].id,
                    user_id: users[0].id,
                    firewall_type: firewall_entity_1.FirewallType.PALO_ALTO,
                    brand: 'Palo Alto',
                    model: 'PA-5220',
                    ip_nms: '10.1.0.1',
                    ip_service: '192.168.2.1',
                    vlan_nms: 110,
                    vlan_service: 210,
                    username: 'admin',
                    password: 'PaloAlto@123',
                    firmware_version: '10.2.0',
                    serial_number: 'PA5220-DC1',
                    status: firewall_entity_1.EquipmentStatus.ACTIVE,
                    high_availability: true,
                    monitoring_enabled: true,
                    security_policies_count: 128,
                    cpu: 45,
                    memory: 62,
                },
            ];
            for (const fw of firewalls) {
                await fwRepo.save(fwRepo.create(fw));
            }
            console.log('✅ Firewalls créés');
            await pause();
        }
        else
            console.log('⏭️ Firewalls déjà présents');
        if (await routerRepo.count() === 0) {
            console.log('📡 Création des routeurs...');
            const routers = [
                {
                    name: 'RT-HQ-CORE',
                    site_id: sites[0].id,
                    user_id: users[0].id,
                    brand: 'Cisco',
                    model: 'ISR 4451',
                    ip_nms: '10.0.1.1',
                    ip_service: '192.168.1.2',
                    vlan_nms: 100,
                    vlan_service: 200,
                    username: 'admin',
                    password: 'Cisco@456',
                    operating_system: 'IOS-XE 17.6',
                    serial_number: 'FTX1234A567',
                    interfaces_count: 8,
                    interfaces_up_count: 6,
                    routing_protocols: ['OSPF', 'BGP'],
                    status: firewall_entity_1.EquipmentStatus.ACTIVE,
                },
            ];
            for (const router of routers) {
                await routerRepo.save(routerRepo.create(router));
            }
            console.log('✅ Routeurs créés');
            await pause();
        }
        else
            console.log('⏭️ Routeurs déjà présents');
        if (await swRepo.count() === 0) {
            console.log('🔀 Création des switches...');
            const switches = [
                {
                    name: 'SW-HQ-ACCESS-01',
                    site_id: sites[0].id,
                    user_id: users[1].id,
                    brand: 'Cisco',
                    model: 'Catalyst 9300-48P',
                    ip_nms: '10.0.2.1',
                    vlan_nms: 100,
                    username: 'admin',
                    password: 'CiscoSwitch@1',
                    firmware_version: '17.6.1',
                    ports_total: 48,
                    ports_used: 34,
                    serial_number: 'FCW2345G890',
                    status: firewall_entity_1.EquipmentStatus.ACTIVE,
                },
            ];
            for (const sw of switches) {
                await swRepo.save(swRepo.create(sw));
            }
            console.log('✅ Switches créés');
            await pause();
        }
        else
            console.log('⏭️ Switches déjà présents');
        await AppDataSource.destroy();
        console.log('\n🎉 SEED TERMINÉ PROPREMENT');
    }
    catch (err) {
        console.error('❌ Erreur seed :', err);
        try {
            if (AppDataSource.isInitialized) {
                await AppDataSource.destroy();
            }
        }
        catch (closeErr) {
            console.error('❌ Erreur fermeture DB :', closeErr);
        }
        process.exit(1);
    }
}
seed();
//# sourceMappingURL=seed.js.map