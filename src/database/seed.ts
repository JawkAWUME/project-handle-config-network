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

const isProd = process.env.APP_ENV === 'production';
const force = process.env.SEED_FORCE === 'true';

const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [User, Site, Firewall, Router, Switch],
  synchronize: false,
  ssl: { rejectUnauthorized: false },
});

async function seed() {
  try {
    await AppDataSource.initialize();
    console.log('✅ Connexion DB établie');

    const userRepo = AppDataSource.getRepository(User);
    const siteRepo = AppDataSource.getRepository(Site);
    const fwRepo = AppDataSource.getRepository(Firewall);
    const routerRepo = AppDataSource.getRepository(Router);
    const swRepo = AppDataSource.getRepository(Switch);

    // 🔥 RESET OPTIONNEL (prod safe si SEED_FORCE=true)
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
      ]);

      console.log('✅ Users créés');
    } else {
      console.log('⏭️ Users déjà présents');
    }

    const users = await userRepo.find();

    // ================= SITES =================
    let sites: Site[] = [];

    if (await siteRepo.count() === 0) {
      sites = await siteRepo.save([
        siteRepo.create({
          name: 'Siège Social',
          code: 'HQ',
          city: 'Dakar',
          country: 'Sénégal',
          address: '12 Av. Léopold Sédar Senghor',
          status: 'active',
        }),
        siteRepo.create({
          name: 'Agence Plateau',
          code: 'PLT',
          city: 'Dakar',
          country: 'Sénégal',
          address: '5 Rue Carnot',
          status: 'active',
        }),
        siteRepo.create({
          name: 'Agence Thiès',
          code: 'THS',
          city: 'Thiès',
          country: 'Sénégal',
          status: 'active',
        }),
        siteRepo.create({
          name: 'DataCenter',
          code: 'DC1',
          city: 'Dakar',
          country: 'Sénégal',
          status: 'active',
          capacity: 200,
        }),
      ]);

      console.log('✅ Sites créés');
    } else {
      sites = await siteRepo.find();
      console.log('⏭️ Sites déjà présents');
    }

    // ================= FIREWALLS =================
    if (await fwRepo.count() === 0) {
      const firewalls: DeepPartial<Firewall>[] = [
        {
          name: 'FW-HQ-01',
          site_id: sites[0].id,
          user_id: users[0].id,
          firewall_type: FirewallType.FORTINET,
          status: EquipmentStatus.ACTIVE,
          connection_type: ConnectionType.FO,
        },
        {
          name: 'FW-DC-01',
          site_id: sites[3].id,
          user_id: users[0].id,
          firewall_type: FirewallType.PALO_ALTO,
          status: EquipmentStatus.ACTIVE,
          connection_type: ConnectionType.BOTH,
        },
      ];

      await fwRepo.save(firewalls);
      console.log('✅ Firewalls créés');
    } else {
      console.log('⏭️ Firewalls déjà présents');
    }

    // ================= ROUTERS =================
    if (await routerRepo.count() === 0) {
      const routers: DeepPartial<Router>[] = [
        {
          name: 'RT-HQ-CORE',
          site_id: sites[0].id,
          user_id: users[0].id,
          status: EquipmentStatus.ACTIVE,
          connection_type: ConnectionType.FO,
        },
        {
          name: 'RT-DC-EDGE',
          site_id: sites[3].id,
          user_id: users[0].id,
          status: EquipmentStatus.ACTIVE,
          connection_type: ConnectionType.BOTH,
        },
      ];

      await routerRepo.save(routers);
      console.log('✅ Routeurs créés');
    } else {
      console.log('⏭️ Routeurs déjà présents');
    }

    // ================= SWITCHES =================
    if (await swRepo.count() === 0) {
      const switches: DeepPartial<Switch>[] = [
        {
          name: 'SW-HQ-01',
          site_id: sites[0].id,
          user_id: users[1].id,
          status: EquipmentStatus.ACTIVE,
          connection_type: ConnectionType.FO,
        },
        {
          name: 'SW-DC-01',
          site_id: sites[3].id,
          user_id: users[0].id,
          status: EquipmentStatus.ACTIVE,
          connection_type: ConnectionType.BOTH,
        },
      ];

      await swRepo.save(switches);
      console.log('✅ Switches créés');
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