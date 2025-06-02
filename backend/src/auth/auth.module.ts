import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RefreshTokenService } from './refresh-token.service';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { MailModule } from 'src/mail/mail.module';
import { OtpService } from './otp.service';
import { GoogleService } from './google.service';
import { HttpModule } from '@nestjs/axios';
import { RepositoryModule } from '../repositories/repository.module';

@Module({
  imports: [PassportModule, RepositoryModule, MailModule, HttpModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    RefreshTokenService,
    RefreshTokenGuard,
    OtpService,
    GoogleService,
  ],
  exports: [AuthService, RefreshTokenService, OtpService, GoogleService],
})
export class AuthModule {}
