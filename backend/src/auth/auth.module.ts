import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AccountModule } from '../account/account.module';
import { EventModule } from 'src/event/event.module';
import { TenantModule } from 'src/tenant/tenant.module';
import { PocModule } from 'src/poc/poc.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshToken } from './entities/token.entity';
@Module({
  imports: [
    AccountModule,
    EventModule,
    TenantModule,
    PassportModule,
    PocModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: '1h',
        },
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([RefreshToken]),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
