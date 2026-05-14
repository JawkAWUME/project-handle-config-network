// src/database/seed.ts

import 'reflect-metadata';
import * as dotenv from 'dotenv';
dotenv.config({ path: `.env.${process.env.APP_ENV || 'development'}` });

import { DataSource, DeepPartial } from 'typeorm';
import * as bcrypt from 'bcryptjs';

import { User, UserRole } from '../users/user.entity';
import { Site, ConnectionType } from '../sites/site.entity';  // 🆕 import

import {
  EquipmentStatus,
  Firewall,
  FirewallType
} from '../firewalls/firewall.entity';

import { Router } from '../routers/router.entity';
import { Switch } from '../switchs/switch.entity';

const force = process.env.SEED_FORCE === 'true';
const isProd = process.env.APP_ENV === 'production';
const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [User, Site, Firewall, Router, Switch],
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

    const userRepo = AppDataSource.getRepository(User);
    const siteRepo = AppDataSource.getRepository(Site);
    const fwRepo = AppDataSource.getRepository(Firewall);
    const routerRepo = AppDataSource.getRepository(Router);
    const swRepo = AppDataSource.getRepository(Switch);

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

    // ── Users ──
    if (await userRepo.count() === 0) {
      console.log('👤 Création des utilisateurs...');
      const passwordHash = await bcrypt.hash('password', 12);
      const usersData: DeepPartial<User>[] = [
        { name: 'Administrateur', email: 'admin@network.local', password: passwordHash, role: UserRole.ADMIN, department: 'Informatique', is_active: true },
        { name: 'Agent Réseau', email: 'agent@network.local', password: passwordHash, role: UserRole.AGENT, department: 'Réseau', is_active: true },
        { name: 'Observateur', email: 'viewer@network.local', password: passwordHash, role: UserRole.VIEWER, department: 'Direction', is_active: true },
        { name: 'Support Technique', email: 'support@network.local', password: passwordHash, role: UserRole.AGENT, department: 'Support', is_active: true },
        { name: 'Consultant Externe', email: 'consultant@network.local', password: passwordHash, role: UserRole.VIEWER, department: 'Consulting', is_active: false },
      ];
      for (const user of usersData) {
        await userRepo.save(userRepo.create(user));
      }
      console.log('✅ Users créés (5)');
      await pause();
    } else console.log('⏭️ Users déjà présents');
    const users = await userRepo.find();

    // ── Sites ──
    let sites: Site[] = [];
    if (await siteRepo.count() === 0) {
      console.log('🏢 Création des sites...');
      const sitesData: DeepPartial<Site>[] = [
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
          connection_type: ConnectionType.FO,          // 🆕 Fibre Optique
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
          connection_type: ConnectionType.FH,          // 🆕 Faisceau Hertzien
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
          connection_type: ConnectionType.FH,
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
          connection_type: ConnectionType.BOTH,        // 🆕 FH + FO
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
          connection_type: ConnectionType.FO,
        },
      ];
      for (const site of sitesData) {
        const created = await siteRepo.save(siteRepo.create(site));
        sites.push(created);
      }
      console.log('✅ Sites créés (5)');
      await pause();
    } else {
      sites = await siteRepo.find();
      console.log('⏭️ Sites déjà présents');
    }

    // ── Firewalls ──
    if (await fwRepo.count() === 0) {
      console.log('🔥 Création des firewalls...');
      const firewalls: DeepPartial<Firewall>[] = [
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
          firmware_version: '7.2.4',
          serial_number: 'FT600E-001',
          status: EquipmentStatus.ACTIVE,
          high_availability: true,
          monitoring_enabled: true,
          security_policies_count: 42,
          cpu: 23,
          memory: 45,
          // 🚫 plus de connection_type ici
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
        },
      ];
      for (const fw of firewalls) {
        await fwRepo.save(fwRepo.create(fw));
      }
      console.log('✅ Firewalls créés');
      await pause();
    } else console.log('⏭️ Firewalls déjà présents');

    // ── Routers ──
    if (await routerRepo.count() === 0) {
      console.log('📡 Création des routeurs...');
      const routers: DeepPartial<Router>[] = [
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
          status: EquipmentStatus.ACTIVE,
          // 🚫 sans connection_type
        },
      ];
      for (const router of routers) {
        await routerRepo.save(routerRepo.create(router));
      }
      console.log('✅ Routeurs créés');
      await pause();
    } else console.log('⏭️ Routeurs déjà présents');

    // ── Switches ──
    if (await swRepo.count() === 0) {
      console.log('🔀 Création des switches...');
      const switches: DeepPartial<Switch>[] = [
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
          // 🚫 sans connection_type
        },
      ];
      for (const sw of switches) {
        await swRepo.save(swRepo.create(sw));
      }
      console.log('✅ Switches créés');
      await pause();
    } else console.log('⏭️ Switches déjà présents');

    await AppDataSource.destroy();
    console.log('\n🎉 SEED TERMINÉ PROPREMENT');
  } catch (err) {
    console.error('❌ Erreur seed :', err);
    try {
      if (AppDataSource.isInitialized) {
        await AppDataSource.destroy();
      }
    } catch (closeErr) {
      console.error('❌ Erreur fermeture DB :', closeErr);
    }
    process.exit(1);
  }
}

seed();