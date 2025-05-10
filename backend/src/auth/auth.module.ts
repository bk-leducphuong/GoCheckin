import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AccountModule } from '../account/account.module';
import { EventModule } from 'src/event/event.module';
import { TenantModule } from 'src/tenant/tenant.module';
import { PocModule } from 'src/poc/poc.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Token } from './entities/token.entity';
import { RefreshTokenService } from './refresh-token.service';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { MailModule } from 'src/mail/mail.module';
import { Otp } from './entities/otp.entity';
import { OtpService } from './otp.service';
import { ResetToken } from './entities/reset-token.entity';

@Module({
  imports: [
    AccountModule,
    EventModule,
    TenantModule,
    PassportModule,
    PocModule,
    TypeOrmModule.forFeature([Token, Otp, ResetToken]),
    MailModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    RefreshTokenService,
    RefreshTokenGuard,
    OtpService,
  ],
  exports: [AuthService, RefreshTokenService, OtpService],
})
export class AuthModule {}
