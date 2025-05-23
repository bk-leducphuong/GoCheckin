import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { Logger } from 'typeorm';
import { Account } from '../../account/entities/account.entity';
import { AccountTenant } from '../../account/entities/account-tenant.entity';
import { Tenant } from '../../tenant/entities/tenant.entity';
import { Event } from '../../event/entities/event.entity';
import { PointOfCheckin } from '../../poc/entities/poc.entity';
import { Guest } from '../../guest/entities/guest.entity';
import { Token } from 'src/auth/entities/token.entity';
import { EventCheckinAnalytics } from 'src/analysis/entities/event-checkin-analytics.entity';
import { PointCheckinAnalytics } from 'src/analysis/entities/point-checkin-analytics.entity';
import { Otp } from 'src/auth/entities/otp.entity';
import { ResetToken } from 'src/auth/entities/reset-token.entity';
import { FloorPlan } from 'src/floor-plan/entities/floor-plan.entity';
import { PocLocation } from '../../poc/entities/poc-location.entity';

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

class CustomLogger implements Logger {
  private logToFile(message: string) {
    const logFile = path.join(logsDir, 'typeorm.log');
    const timestamp = new Date().toISOString();
    fs.appendFileSync(logFile, `[${timestamp}] ${message}\n`);
  }

  logQuery(query: string, parameters?: any[]) {
    const message = `Query: ${query}${parameters ? ` -- Parameters: ${JSON.stringify(parameters)}` : ''}`;
    this.logToFile(message);
  }

  logQueryError(error: string, query: string, parameters?: any[]) {
    const message = `Query Error: ${error}; Query: ${query}${parameters ? ` -- Parameters: ${JSON.stringify(parameters)}` : ''}`;
    this.logToFile(message);
  }

  logQuerySlow(time: number, query: string, parameters?: any[]) {
    const message = `Slow Query (${time}ms): ${query}${parameters ? ` -- Parameters: ${JSON.stringify(parameters)}` : ''}`;
    this.logToFile(message);
  }

  logSchemaBuild(message: string) {
    this.logToFile(`Schema Build: ${message}`);
  }

  logMigration(message: string) {
    this.logToFile(`Migration: ${message}`);
  }

  log(level: 'log' | 'info' | 'warn', message: string) {
    this.logToFile(`${level.toUpperCase()}: ${message}`);
  }
}

export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  type: 'postgres', // Specifies we're using PostgreSQL database
  host: configService.get('DATABASE_HOST', 'localhost'),
  port: configService.get('DATABASE_PORT', 5432),
  username: configService.get('DATABASE_USER', 'postgres'),
  password: configService.get('DATABASE_PASSWORD', ''),
  database: configService.get('DATABASE_NAME', 'go_checkin'),
  entities: [
    Account,
    AccountTenant,
    Tenant,
    Event,
    PointOfCheckin,
    Guest,
    Token,
    EventCheckinAnalytics,
    PointCheckinAnalytics,
    Otp,
    ResetToken,
    FloorPlan,
    PocLocation,
  ],
  migrations: [__dirname + '/../database/migrations/*{.ts,.js}'], // looks for migration files in the migrations directory
  synchronize: configService.get('NODE_ENV') === 'development', // automatically updates database schema
  logging: true, // Enable logging for all environments
  logger: new CustomLogger(),
  maxQueryExecutionTime: 1000, // Log queries that take more than 1 second
});
