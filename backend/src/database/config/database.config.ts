import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { Logger } from 'typeorm';

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../../logs');
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
  entities: [__dirname + '/../**/*.entity{.ts,.js}'], // scans for all files ending in .entity.ts or entity.js
  migrations: [__dirname + '/../database/migrations/*{.ts,.js}'], // looks for migration files in the migrations directory
  synchronize: configService.get('NODE_ENV') === 'development', // automatically updates database schema
  logging: true, // Enable logging for all environments
  logger: new CustomLogger(),
  maxQueryExecutionTime: 1000, // Log queries that take more than 1 second
});
