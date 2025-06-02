import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config({ path: `.env.${process.env.NODE_ENV || 'development'}` });

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  username: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || '',
  database: process.env.DATABASE_NAME || 'go_checkin',
  entities: ['dist/**/*.entity{.js}'],
  migrations: ['dist/src/database/migrations/*.js'],
  synchronize: false,
  logging: false,
  migrationsTableName: 'migrations',
  migrationsRun: false,
});
