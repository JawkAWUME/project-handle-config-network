// data-source.ts
import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config();

const isLocal = !process.env.DATABASE_URL?.includes('render.com');
export default new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
  logging: true,
  ssl: isLocal ? false :{ rejectUnauthorized: false },
});