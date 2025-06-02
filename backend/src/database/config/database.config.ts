import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { Logger } from 'typeorm';

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
): TypeOrmModuleOptions => {
  const isProduction = configService.get('NODE_ENV') === 'production';

  return {
    type: 'postgres',
    host: configService.get('DATABASE_HOST', 'localhost'),
    port: configService.get('DATABASE_PORT', 5432),
    username: configService.get('DATABASE_USER', 'postgres'),
    password: configService.get('DATABASE_PASSWORD', ''),
    database: configService.get('DATABASE_NAME', 'go_checkin'),
    entities: ['dist/**/*.entity{.js}'],
    migrations: ['dist/src/database/migrations/*.js'],
    migrationsRun: isProduction,
    synchronize: false,
    logging: !isProduction,
    logger: new CustomLogger(),
    maxQueryExecutionTime: 1000,
  };
};
