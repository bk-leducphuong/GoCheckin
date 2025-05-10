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
import { SocketGateway } from './gateways/socket.gateway';
import { ScheduleModule } from '@nestjs/schedule';
import { AnalysisModule } from './analysis/analysis.module';
import { MailModule } from './mail/mail.module';
import { FloorPlan } from './floor-plan/entities/floor-plan.entity';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // make configuration available throughout the app
      envFilePath: `.env.${process.env.NODE_ENV}`,
    }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      // use async configuration to wait for eviroment variables to load
      imports: [ConfigModule], // inject ConfigModule to use configuration
      inject: [ConfigService], // inject ConfigService to read enviroment variable
      useFactory: (configService: ConfigService) => ({
        ...getDatabaseConfig(configService),
        autoLoadEntities: true,
      }),
    }),
    AuthModule,
    AccountModule,
    EventModule,
    TenantModule,
    PocModule,
    GuestModule,
    AnalysisModule,
    MailModule,
    FloorPlan,
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn:
            configService.get<string>('JWT_ACCESS_EXPIRATION') || '15m',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [],
  providers: [SocketGateway],
})
export class AppModule {}
