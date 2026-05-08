// src/database/seed.ts
import 'reflect-metadata';
import * as dotenv from 'dotenv';
dotenv.config();

import { DataSource, DeepPartial } from 'typeorm';
import * as bcrypt from 'bcryptjs';

import { User, UserRole } from '../users/user.entity';
import { Site } from '../sites/site.entity';
import { ConnectionType, EquipmentStatus, Firewall, FirewallType } from '../firewalls/firewall.entity';
import { Router } from '../routers/router.entity';
import { Switch } from '../switchs/switch.entity';

const force = process.env.SEED_FORCE === 'true';

const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [User, Site, Firewall, Router, Switch],
  synchronize: false,
  ssl: process.env.DATABASE_URL?.includes('render.com')
    ? { rejectUnauthorized: false }
    : false,
  extra: {
    max: 5,                             // limite de connexions simultanées
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,     // ⏱️ attendre jusqu'à 10s avant d'abandonner
    keepAlive: true,
  },
  connectTimeoutMS: 15000,             // timeout global TypeORM
});

async function seed() {
  console.log('🔧 DATABASE_URL =', process.env.DATABASE_URL ? '***' : 'NON DÉFINIE');
  try {
    await AppDataSource.initialize();
    console.log('✅ Connexion DB établie');

    const userRepo = AppDataSource.getRepository(User);
    const siteRepo = AppDataSource.getRepository(Site);
    const fwRepo = AppDataSource.getRepository(Firewall);
    const routerRepo = AppDataSource.getRepository(Router);
    const swRepo = AppDataSource.getRepository(Switch);

    // 🔥 RESET OPTIONNEL (uniquement avec SEED_FORCE=true)
    if (force) {
      await AppDataSource.query(`
        TRUNCATE users, sites, firewalls, routers, switches
        RESTART IDENTITY CASCADE
      `);
      console.log('🔥 DB reset complet');
    }

    // ================= USERS =================
    if (await userRepo.count() === 0) {
      const passwordHash = await bcrypt.hash('password', 12);
      await userRepo.save([
        userRepo.create({
          name: 'Administrateur',
          email: 'admin@network.local',
          password: passwordHash,
          role: UserRole.ADMIN,
          department: 'Informatique',
          is_active: true,
        }),
        userRepo.create({
          name: 'Agent Réseau',
          email: 'agent@network.local',
          password: passwordHash,
          role: UserRole.AGENT,
          department: 'Réseau',
          is_active: true,
        }),
        userRepo.create({
          name: 'Observateur',
          email: 'viewer@network.local',
          password: passwordHash,
          role: UserRole.VIEWER,
          department: 'Direction',
          is_active: true,
        }),
        userRepo.create({
          name: 'Support Technique',
          email: 'support@network.local',
          password: passwordHash,
          role: UserRole.AGENT,
          department: 'Support',
          is_active: true,
        }),
        userRepo.create({
          name: 'Consultant Externe',
          email: 'consultant@network.local',
          password: passwordHash,
          role: UserRole.VIEWER,
          department: 'Consulting',
          is_active: false,
        }),
      ]);
      console.log('✅ Users créés (5)');
    } else {
      console.log('⏭️ Users déjà présents');
    }

    const users = await userRepo.find();

    // ================= SITES =================
    let sites: DeepPartial<Site>[] = [];
    if (await siteRepo.count() === 0) {
      sites = await siteRepo.save([
        {
          name: 'Siège Social Dakar',
          code: 'HQ-DKR',
          city: 'Dakar',
          region: 'dakar',
          country: 'Sénégal',
          address: '12 Av. Léopold Sédar Senghor',
          postal_code: '10000',
          latitude: 14.7167,
          longitude: -17.4677,
          phone: '+221 33 123 45 67',
          technical_contact: 'Admin IT',
          technical_email: 'it@company.sn',
          status: 'active',
          description: 'Bâtiment principal – direction générale',
        },
        {
          name: 'Agence Plateau',
          code: 'AGT-PLT',
          city: 'Dakar',
          region: 'dakar',
          country: 'Sénégal',
          address: '5 Rue Carnot',
          postal_code: '10001',
          latitude: 14.6833,
          longitude: -17.4833,
          phone: '+221 33 234 56 78',
          technical_contact: 'Technicien A',
          technical_email: 'tech.plateau@company.sn',
          status: 'active',
        },
        {
          name: 'Agence Thiès',
          code: 'AGT-THS',
          city: 'Thiès',
          region: 'thies',
          country: 'Sénégal',
          address: '10 Rue de la Gare',
          postal_code: '21000',
          latitude: 14.7911,
          longitude: -16.9356,
          phone: '+221 33 345 67 89',
          technical_contact: 'Technicien B',
          technical_email: 'tech.thies@company.sn',
          status: 'active',
        },
        {
          name: 'DataCenter Principal',
          code: 'DC-MAIN',
          city: 'Dakar',
          region: 'dakar',
          country: 'Sénégal',
          address: 'Rue de la Technologie, Zone Industrielle',
          postal_code: '10002',
          latitude: 14.7500,
          longitude: -17.4000,
          status: 'active',
          capacity: 200,
          technical_contact: 'DBA Team',
          technical_email: 'dba@datacenter.sn',
        },
        {
          name: 'Agence Saint‑Louis',
          code: 'AGT-SL',
          city: 'Saint‑Louis',
          region: 'saint-louis',
          country: 'Sénégal',
          address: '38 Avenue Faidherbe',
          postal_code: '32000',
          latitude: 16.0179,
          longitude: -16.4896,
          status: 'inactive',
        }
      ]);
      console.log('✅ Sites créés (5)');
    } else {
      sites = await siteRepo.find();
      console.log('⏭️ Sites déjà présents');
    }

    // ================= FIREWALLS =================
    if (await fwRepo.count() === 0) {
      await fwRepo.save([
        {
          name: 'FW-HQ-01',
          site_id: sites[0].id,
          user_id: users[0].id,
          firewall_type: FirewallType.FORTINET,
          brand: 'Fortinet',
          model: 'FortiGate 600E',
          ip_nms: '10.0.0.1',
          ip_service: '192.168.1.1',
          vlan_nms: 100,
          vlan_service: 200,
          username: 'admin',
          password: 'Fortinet@123',
          enable_password: 'enable123',
          firmware_version: '7.2.4',
          serial_number: 'FT600E-001',
          status: EquipmentStatus.ACTIVE,
          high_availability: true,
          monitoring_enabled: true,
          security_policies_count: 42,
          cpu: 23,
          memory: 45,
          connection_type: ConnectionType.FO,
          notes: 'Firewall principal siège',
        },
        {
          name: 'FW-DC-01',
          site_id: sites[3].id,
          user_id: users[0].id,
          firewall_type: FirewallType.PALO_ALTO,
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
          status: EquipmentStatus.ACTIVE,
          high_availability: true,
          monitoring_enabled: true,
          security_policies_count: 128,
          cpu: 45,
          memory: 62,
          connection_type: ConnectionType.BOTH,
        },
        {
          name: 'FW-PLT-01',
          site_id: sites[1].id,
          user_id: users[1].id,
          firewall_type: FirewallType.CISCO_ASA,
          brand: 'Cisco',
          model: 'ASA 5525-X',
          ip_nms: '10.2.0.1',
          ip_service: '192.168.3.1',
          vlan_nms: 120,
          vlan_service: 220,
          username: 'cisco',
          password: 'Cisco@123',
          firmware_version: '9.16',
          serial_number: 'ASA5525-001',
          status: EquipmentStatus.INACTIVE,
          monitoring_enabled: false,
          security_policies_count: 18,
          cpu: 0,
          memory: 0,
          connection_type: ConnectionType.FH,
          notes: 'Agence Plateau – désactivé',
        },
        {
          name: 'FW-SL-01',
          site_id: sites[4].id,
          user_id: users[1].id,
          firewall_type: FirewallType.CHECKPOINT,
          brand: 'Check Point',
          model: '5800',
          ip_nms: '10.4.0.1',
          ip_service: '192.168.4.1',
          vlan_nms: 130,
          vlan_service: 230,
          username: 'admin',
          password: 'CheckPoint@123',
          status: EquipmentStatus.WARNING,
          cpu: 12,
          memory: 30,
          security_policies_count: 56,
          connection_type: ConnectionType.FO,
          notes: 'Agence Saint‑Louis – avertissement',
        },
      ]);
      console.log('✅ Firewalls créés (4)');
    } else {
      console.log('⏭️ Firewalls déjà présents');
    }

    // ================= ROUTERS =================
    if (await routerRepo.count() === 0) {
      await routerRepo.save([
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
          enable_password: 'cisco456',
          operating_system: 'IOS-XE 17.6',
          serial_number: 'FTX1234A567',
          interfaces_count: 8,
          interfaces_up_count: 6,
          routing_protocols: ['OSPF', 'BGP'],
          status: EquipmentStatus.ACTIVE,
          connection_type: ConnectionType.FO,
          notes: 'Routeur cœur du siège',
        },
        {
          name: 'RT-DC-EDGE',
          site_id: sites[3].id,
          user_id: users[0].id,
          brand: 'Juniper',
          model: 'MX204',
          ip_nms: '10.1.1.1',
          ip_service: '192.168.2.2',
          vlan_nms: 110,
          vlan_service: 210,
          username: 'juniper',
          password: 'Juniper@789',
          operating_system: 'JunOS 21.4',
          serial_number: 'MX204-DC1',
          interfaces_count: 4,
          interfaces_up_count: 4,
          routing_protocols: ['BGP', 'IS-IS'],
          status: EquipmentStatus.ACTIVE,
          connection_type: ConnectionType.BOTH,
        },
        {
          name: 'RT-THS-01',
          site_id: sites[2].id,
          user_id: users[1].id,
          brand: 'Cisco',
          model: 'ISR 1111',
          ip_nms: '10.3.1.1',
          ip_service: '192.168.3.2',
          vlan_nms: 120,
          vlan_service: 220,
          username: 'admin',
          password: 'CiscoThs@111',
          operating_system: 'IOS-XE 16.12',
          serial_number: 'ISR1111-THS',
          interfaces_count: 4,
          interfaces_up_count: 3,
          status: EquipmentStatus.ACTIVE,
          connection_type: ConnectionType.FH,
        },
        {
          name: 'RT-PLT-01',
          site_id: sites[1].id,
          user_id: users[1].id,
          brand: 'MikroTik',
          model: 'CCR1036-8G-2S+',
          ip_nms: '10.2.1.1',
          ip_service: '192.168.4.2',
          vlan_nms: 130,
          vlan_service: 230,
          username: 'admin',
          password: 'MikroTik@2024',
          operating_system: 'RouterOS 7.10',
          interfaces_count: 12,
          interfaces_up_count: 10,
          status: EquipmentStatus.ACTIVE,
          connection_type: ConnectionType.FO,
          notes: 'Routeur agence Plateau',
        },
        {
          name: 'RT-DC-INTERNAL',
          site_id: sites[3].id,
          user_id: users[0].id,
          brand: 'Cisco',
          model: 'ISR 4321',
          ip_nms: '10.1.2.1',
          ip_service: '172.16.0.1',
          vlan_nms: 150,
          vlan_service: 250,
          username: 'admin',
          password: 'CiscoInternal@999',
          enable_password: 'internal999',
          operating_system: 'IOS-XE 17.9',
          interfaces_count: 2,
          interfaces_up_count: 2,
          routing_protocols: ['OSPF'],
          status: EquipmentStatus.ACTIVE,
          connection_type: ConnectionType.FO,
          notes: 'Routeur interne data center',
        },
      ]);
      console.log('✅ Routeurs créés (5)');
    } else {
      console.log('⏭️ Routeurs déjà présents');
    }

    // ================= SWITCHES =================
    if (await swRepo.count() === 0) {
      await swRepo.save([
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
          status: EquipmentStatus.ACTIVE,
          connection_type: ConnectionType.FO,
          notes: 'Switch d\'accès principal',
        },
        {
          name: 'SW-HQ-CORE-01',
          site_id: sites[0].id,
          user_id: users[0].id,
          brand: 'Cisco',
          model: 'Catalyst 9500-24Y4C',
          ip_nms: '10.0.2.2',
          vlan_nms: 100,
          username: 'admin',
          password: 'CiscoCore@2',
          firmware_version: '17.6.1',
          ports_total: 24,
          ports_used: 20,
          status: EquipmentStatus.ACTIVE,
          connection_type: ConnectionType.BOTH,
        },
        {
          name: 'SW-DC-TOR-01',
          site_id: sites[3].id,
          user_id: users[0].id,
          brand: 'Arista',
          model: '7050CX3-32S',
          ip_nms: '10.1.2.1',
          vlan_nms: 110,
          username: 'admin',
          password: 'Arista@123',
          firmware_version: '4.28.0',
          ports_total: 32,
          ports_used: 28,
          serial_number: 'AR-DC-TOR-01',
          status: EquipmentStatus.ACTIVE,
          connection_type: ConnectionType.FO,
          notes: 'Top of Rack DataCenter',
        },
        {
          name: 'SW-DC-STORAGE',
          site_id: sites[3].id,
          user_id: users[0].id,
          brand: 'Dell',
          model: 'PowerSwitch S5248F-ON',
          ip_nms: '10.1.2.2',
          vlan_nms: 150,
          username: 'root',
          password: 'DellSwitch@456',
          firmware_version: '10.5.3',
          ports_total: 48,
          ports_used: 40,
          status: EquipmentStatus.ACTIVE,
          connection_type: ConnectionType.FO,
          notes: 'Switch stockage SAN',
        },
        {
          name: 'SW-PLT-01',
          site_id: sites[1].id,
          user_id: users[1].id,
          brand: 'HP',
          model: 'Aruba 2930F',
          ip_nms: '10.2.2.1',
          vlan_nms: 120,
          username: 'admin',
          password: 'Aruba@789',
          ports_total: 24,
          ports_used: 0,
          status: EquipmentStatus.INACTIVE,
          connection_type: ConnectionType.FH,
          notes: 'Switch plateau – hors service',
        },
        {
          name: 'SW-THS-01',
          site_id: sites[2].id,
          user_id: users[1].id,
          brand: 'Cisco',
          model: 'Catalyst 2960X',
          ip_nms: '10.3.2.1',
          vlan_nms: 120,
          username: 'admin',
          password: 'CiscoThs@22',
          firmware_version: '15.2.7',
          ports_total: 24,
          ports_used: 12,
          serial_number: 'FOC1234THS',
          status: EquipmentStatus.ACTIVE,
          connection_type: ConnectionType.FH,
          notes: 'Switch agence Thiès',
        },
        {
          name: 'SW-SL-01',
          site_id: sites[4].id,
          user_id: users[1].id,
          brand: 'Cisco',
          model: 'Catalyst 2960XR',
          ip_nms: '10.4.2.1',
          vlan_nms: 130,
          status: EquipmentStatus.WARNING,
          ports_total: 24,
          ports_used: 8,
          connection_type: ConnectionType.FO,
          notes: 'Switch agence Saint‑Louis – alerte',
        },
      ]);
      console.log('✅ Switches créés (7)');
    } else {
      console.log('⏭️ Switches déjà présents');
    }

    await AppDataSource.destroy();
    console.log('\n🎉 SEED TERMINÉ PROPREMENT');
  } catch (err) {
    console.error('❌ Erreur seed :', err);
    process.exit(1);
  }
}

seed();