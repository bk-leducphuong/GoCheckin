import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getDatabaseConfig } from './database/config/database.config';
import { AccountModule } from './account/account.module';
import { AuthModule } from './auth/auth.module';
import { EventModule } from './event/event.module';
import { TenantModule } from './tenant/tenant.module';
import { PocModule } from './poc/poc.module';
import { GuestModule } from './guest/guest.module';
import { ScheduleModule } from '@nestjs/schedule';
import { AnalysisModule } from './analysis/analysis.module';
import { MailModule } from './mail/mail.module';
import { FloorPlan } from './floor-plan/entities/floor-plan.entity';
import { JwtModule } from '@nestjs/jwt';
import { SocketModule } from './gateways/socket.module';
import { RedisModule } from './redis/redis.module';
import { HealthModule } from './health/health.module';
import { RepositoryModule } from './repositories/repository.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
    }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        ...getDatabaseConfig(configService),
        autoLoadEntities: true,
      }),
    }),
    RedisModule,
    AuthModule,
    AccountModule,
    EventModule,
    TenantModule,
    PocModule,
    GuestModule,
    AnalysisModule,
    MailModule,
    FloorPlan,
    SocketModule,
    HealthModule,
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule], // The imports array lists other modules that the injected providers of the factory function belong to
      useFactory: (configService: ConfigService) => ({
        // use useFactory to inject other providers like configService
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn:
            configService.get<string>('JWT_ACCESS_EXPIRATION') || '15m',
        },
      }),
      inject: [ConfigService], // The inject array lists providers that Nest will resolve and pass as arguments to the factory function.
    }),
    RepositoryModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
