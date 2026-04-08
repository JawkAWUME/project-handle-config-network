// scripts/run-migrations.ts
import { DataSource } from 'typeorm';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

async function runMigrations() {
  const dataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    entities: [path.join(__dirname, '..', 'dist', '**', '*.entity.js')],
    migrations: [path.join(__dirname, '..', 'dist', 'database', 'migrations', '*.js')],
    synchronize: false,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await dataSource.initialize();
    await dataSource.runMigrations();
    console.log('✅ Migrations exécutées avec succès');
    await dataSource.destroy();
  } catch (error) {
    console.error('❌ Erreur lors des migrations', error);
    process.exit(1);
  }
}

runMigrations();