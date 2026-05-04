// src/database/seed.ts
import 'reflect-metadata';
import * as dotenv from 'dotenv';
dotenv.config();

import { DataSource, DeepPartial } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import * as mysql from 'mysql2/promise';
import { User, UserRole } from '../users/user.entity';
import { Site } from '../sites/site.entity';
import { ConnectionType, EquipmentStatus, Firewall, FirewallType } from '../firewalls/firewall.entity';
import { Router } from '../routers/router.entity';
import { Switch } from '../switchs/switch.entity';

const isProd = process.env.APP_ENV === 'production';

async function ensureDatabaseExists() {
  if (isProd) {
    console.log('📦 Base Postgres Render déjà provisionnée');
    return;
  }
  const host = process.env.DB_HOST;
  // Si aucune variable DB_HOST n'est définie, on ignore la création de la base locale
  if (!host) {
    console.log('⚠️  Variable DB_HOST absente – création de base locale ignorée.');
    return;
  }
  const port = parseInt(process.env.DB_PORT || '3306', 10);
  const user = process.env.DB_USERNAME || 'root';
  const password = process.env.DB_PASSWORD || '';
  const dbName = process.env.DB_DATABASE || 'network_manager';

  const connection = await mysql.createConnection({
    host, port, user, password, multipleStatements: true,
  });
  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
  await connection.end();
  console.log(`📦 Base "${dbName}" vérifiée/créée`);
}

function buildDataSource(): DataSource {
  const databaseUrl = process.env.DATABASE_URL;
  let config: any = {
    type: isProd ? 'postgres' : 'mysql',
    autoLoadEntities: true,
    synchronize: true,
    logging: !isProd,
  };

  if (databaseUrl) {
    const url = new URL(databaseUrl);
    config = {
      ...config,
      url: databaseUrl,
      host: url.hostname,
      port: parseInt(url.port) || (isProd ? 5432 : 3306),
      username: url.username,
      password: url.password,
      database: url.pathname.substring(1),
      ssl: isProd ? { rejectUnauthorized: false } : false,
    };
  } else {
    config = {
      ...config,
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_PORT || (isProd ? '5432' : '3306'), 10),
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME || 'network_manager',
      ssl: isProd ? { rejectUnauthorized: false } : false,
    };
  }

  console.log('Database config:', {
    host: config.host,
    port: config.port,
    database: config.database,
    ssl: config.ssl,
    synchronize: config.synchronize,
  });
  return new DataSource({ ...config, entities: [User, Site, Firewall, Router, Switch] });
}

const AppDataSource = buildDataSource();

async function seed() {
  try {
    if (!isProd) await ensureDatabaseExists();
    await AppDataSource.initialize();
    console.log('✅ Connexion DB établie');

    const userRepo = AppDataSource.getRepository(User);
    const siteRepo = AppDataSource.getRepository(Site);
    const fwRepo = AppDataSource.getRepository(Firewall);
    const routerRepo = AppDataSource.getRepository(Router);
    const swRepo = AppDataSource.getRepository(Switch);

    const siteCount = await siteRepo.count();
    if (siteCount > 0) {
      console.log('ℹ️ Base déjà initialisée, seed ignoré.');
      await AppDataSource.destroy();
      return;
    }

    // 4) Users
    const passwordHash = await bcrypt.hash('password', 12);
    const admin = userRepo.create({
      name: 'Administrateur',
      email: 'admin@network.local',
      password: passwordHash,
      role: UserRole.ADMIN,
      department: 'Informatique',
      is_active: true,
    });
    const agent = userRepo.create({
      name: 'Agent Réseau',
      email: 'agent@network.local',
      password: passwordHash,
      role: UserRole.AGENT,
      department: 'Réseau',
      is_active: true,
    });
    const viewer = userRepo.create({
      name: 'Observateur',
      email: 'viewer@network.local',
      password: passwordHash,
      role: UserRole.VIEWER,
      department: 'Direction',
      is_active: true,
    });
    await userRepo.save([admin, agent, viewer]);
    console.log('✅ Users créés');

    // 5) Sites
    const sites = await siteRepo.save([
      siteRepo.create({
        name: 'Siège Social',
        code: 'HQ',
        city: 'Dakar',
        country: 'Sénégal',
        address: '12 Av. Léopold Sédar Senghor',
        status: 'active',
        technical_contact: 'Admin IT',
        technical_email: 'it@company.sn',
      }),
      siteRepo.create({
        name: 'Agence Plateau',
        code: 'PLT',
        city: 'Dakar',
        country: 'Sénégal',
        address: '5 Rue Carnot',
        status: 'active',
        technical_contact: 'Technicien A',
        technical_email: 'tech.plateau@company.sn',
      }),
      siteRepo.create({
        name: 'Agence Thiès',
        code: 'THS',
        city: 'Thiès',
        country: 'Sénégal',
        status: 'active',
        technical_contact: 'Technicien B',
        technical_email: 'tech.thies@company.sn',
      }),
      siteRepo.create({
        name: 'DataCenter',
        code: 'DC1',
        city: 'Dakar',
        country: 'Sénégal',
        status: 'active',
        capacity: 200,
        technical_contact: 'DBA Team',
      }),
    ]);
    console.log('✅ Sites créés');

    // 6) Firewalls (avec connection_type explicite)
    const firewalls: DeepPartial<Firewall>[] = [
      {
        name: 'FW-HQ-01',
        site_id: sites[0].id,
        user_id: admin.id,
        firewall_type: FirewallType.FORTINET,
        brand: 'Fortinet',
        model: 'FortiGate 600E',
        ip_nms: '10.0.0.1',
        ip_service: '192.168.1.1',
        vlan_nms: 100,
        vlan_service: 200,
        status: EquipmentStatus.ACTIVE,
        high_availability: true,
        monitoring_enabled: true,
        firmware_version: '7.2.4',
        security_policies_count: 42,
        cpu: 23,
        memory: 45,
        connection_type: ConnectionType.FO,
      },
      {
        name: 'FW-DC-01',
        site_id: sites[3].id,
        user_id: admin.id,
        firewall_type: FirewallType.PALO_ALTO,
        brand: 'Palo Alto',
        model: 'PA-5220',
        ip_nms: '10.1.0.1',
        ip_service: '192.168.2.1',
        vlan_nms: 110,
        vlan_service: 210,
        status: EquipmentStatus.ACTIVE,
        high_availability: true,
        monitoring_enabled: true,
        firmware_version: '10.2.0',
        security_policies_count: 128,
        cpu: 45,
        memory: 62,
        connection_type: ConnectionType.BOTH,
      },
      {
        name: 'FW-PLT-01',
        site_id: sites[1].id,
        user_id: agent.id,
        firewall_type: FirewallType.CISCO_ASA,
        brand: 'Cisco',
        model: 'ASA 5525-X',
        ip_nms: '10.2.0.1',
        ip_service: '192.168.3.1',
        status: EquipmentStatus.INACTIVE,
        monitoring_enabled: false,
        firmware_version: '9.16',
        security_policies_count: 18,
        cpu: 0,
        memory: 0,
        connection_type: ConnectionType.FH,
      },
    ];
    await fwRepo.save(firewalls);
    console.log('✅ Firewalls créés');

    // 7) Routers (avec connection_type)
    const routers: DeepPartial<Router>[] = [
      {
        name: 'RT-HQ-CORE',
        site_id: sites[0].id,
        user_id: admin.id,
        brand: 'Cisco',
        model: 'ISR 4451',
        ip_nms: '10.0.1.1',
        ip_service: '192.168.1.2',
        vlan_nms: 100,
        vlan_service: 200,
        status: EquipmentStatus.ACTIVE,
        operating_system: 'IOS-XE 17.6',
        interfaces_count: 8,
        interfaces_up_count: 6,
        routing_protocols: ['OSPF', 'BGP'],
        serial_number: 'FTX1234A567',
        connection_type: ConnectionType.FO,
      },
      {
        name: 'RT-DC-EDGE',
        site_id: sites[3].id,
        user_id: admin.id,
        brand: 'Juniper',
        model: 'MX204',
        ip_nms: '10.1.1.1',
        ip_service: '192.168.2.2',
        status: EquipmentStatus.ACTIVE,
        operating_system: 'JunOS 21.4',
        interfaces_count: 4,
        interfaces_up_count: 4,
        routing_protocols: ['BGP', 'IS-IS'],
        connection_type: ConnectionType.BOTH,
      },
      {
        name: 'RT-THS-01',
        site_id: sites[2].id,
        user_id: agent.id,
        brand: 'Cisco',
        model: 'ISR 1111',
        ip_nms: '10.3.1.1',
        status: EquipmentStatus.ACTIVE,
        operating_system: 'IOS-XE 16.12',
        interfaces_count: 4,
        interfaces_up_count: 3,
        connection_type: ConnectionType.FH,
      },
    ];
    await routerRepo.save(routers);
    console.log('✅ Routeurs créés');

    // 8) Switches (avec connection_type)
    const switches: DeepPartial<Switch>[] = [
      {
        name: 'SW-HQ-ACCESS-01',
        site_id: sites[0].id,
        user_id: agent.id,
        brand: 'Cisco',
        model: 'Catalyst 9300-48P',
        ip_nms: '10.0.2.1',
        vlan_nms: 100,
        status: EquipmentStatus.ACTIVE,
        firmware_version: '17.6.1',
        ports_total: 48,
        ports_used: 34,
        serial_number: 'FCW2345G890',
        connection_type: ConnectionType.FO,
      },
      {
        name: 'SW-HQ-CORE-01',
        site_id: sites[0].id,
        user_id: admin.id,
        brand: 'Cisco',
        model: 'Catalyst 9500-24Y4C',
        ip_nms: '10.0.2.2',
        vlan_nms: 100,
        status: EquipmentStatus.ACTIVE,
        firmware_version: '17.6.1',
        ports_total: 24,
        ports_used: 20,
        connection_type: ConnectionType.BOTH,
      },
      {
        name: 'SW-DC-TOR-01',
        site_id: sites[3].id,
        user_id: admin.id,
        brand: 'Arista',
        model: '7050CX3-32S',
        ip_nms: '10.1.2.1',
        status: EquipmentStatus.ACTIVE,
        firmware_version: '4.28.0',
        ports_total: 32,
        ports_used: 28,
        connection_type: ConnectionType.FO,
      },
      {
        name: 'SW-PLT-01',
        site_id: sites[1].id,
        user_id: agent.id,
        brand: 'HP',
        model: 'Aruba 2930F',
        ip_nms: '10.2.2.1',
        status: EquipmentStatus.INACTIVE,
        ports_total: 24,
        ports_used: 0,
        connection_type: ConnectionType.FH,
      },
    ];
    await swRepo.save(switches);
    console.log('✅ Switches créés');

    await AppDataSource.destroy();
    console.log('\n🎉 Seeding terminé avec succès !');
    console.log('👤 Comptes créés :');
    console.log('   admin@network.local  / password  (role: admin)');
    console.log('   agent@network.local  / password  (role: agent)');
    console.log('   viewer@network.local / password  (role: viewer)');
  } catch (err) {
    console.error('❌ Erreur lors du seeding :', err);
    try {
      if (AppDataSource.isInitialized) await AppDataSource.destroy();
    } catch (e) {
      // ignore
    }
    process.exit(1);
  }
}

seed();