import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthLoginDto } from './dto/auth-login.dto';
import { AuthLoginResponseDto } from './dto/login-response.dto';
import { AuthAdminRegisterDto } from './dto/auth-admin-register.dto';
import { AuthPocRegisterDto } from './dto/auth-poc-register.dto';
import { compare, hash } from 'bcrypt';
import { AccountService } from 'src/account/account.service';
import { UserRole } from 'src/account/entities/account.entity';
import { EventService } from 'src/event/event.service';
import { TenantService } from 'src/tenant/tenant.service';
import { PocService } from 'src/poc/poc.service';
import { ConfigService } from '@nestjs/config';
import { RefreshTokenService } from './refresh-token.service';
import { RequestResetPassword } from './dto/request-reset-password';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { MailService } from 'src/mail/mail.service';
import { OtpService } from './otp.service';
import { ResetToken } from './entities/reset-token.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly accountService: AccountService,
    private readonly eventService: EventService,
    private readonly tenantService: TenantService,
    private readonly pocService: PocService,
    private config: ConfigService,
    private refreshTokenService: RefreshTokenService,
    private mailService: MailService,
    private otpService: OtpService,
    @InjectRepository(ResetToken)
    private readonly resetTokenRepository: Repository<ResetToken>,
  ) {}

  async adminLogin(loginDto: AuthLoginDto): Promise<AuthLoginResponseDto> {
    const user = await this.accountService.findByEmail(loginDto.email);

    // Check if user is an admin
    if (user.role !== UserRole.ADMIN) {
      throw new UnauthorizedException('User is not an admin');
    }

    const isValidPassword = await compare(loginDto.password, user.password);

    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid password');
    }

    // Create refresh token
    const refreshToken = await this.refreshTokenService.generateRefreshToken(
      user.userId,
      loginDto.deviceInfo,
    );

    return {
      accessToken: this.jwtService.sign({
        userId: user.userId,
        role: user.role,
      }),
      refreshToken: refreshToken,
    };
  }

  async pocLogin(loginDto: AuthLoginDto): Promise<AuthLoginResponseDto> {
    const user = await this.accountService.findByEmail(loginDto.email);

    // Check if user is a POC
    if (user.role !== UserRole.POC) {
      throw new UnauthorizedException('User is not a POC');
    }

    const isValidPassword = await compare(loginDto.password, user.password);

    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid password');
    }

    // Get eventcode and point code
    const poc = await this.pocService.getPocByUserId(user.userId);
    if (!poc) {
      throw new UnauthorizedException('User is not a POC');
    }

    // Create refresh token
    const refreshToken = await this.refreshTokenService.generateRefreshToken(
      user.userId,
    );

    return {
      accessToken: this.jwtService.sign({
        userId: user.userId,
        role: user.role,
      }),
      refreshToken: refreshToken,
      pointCode: poc.pointCode,
      eventCode: poc.eventCode,
    };
  }

  async registerAdmin(
    registerDto: AuthAdminRegisterDto,
  ): Promise<AuthLoginResponseDto> {
    // Check if email already exists
    const existingUser = await this.accountService
      .findByEmail(registerDto.email)
      .catch(() => null);
    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    /* Tenant creation */
    const newTenant = await this.tenantService.createTenant({
      tenantCode: registerDto.tenantCode,
      tenantName: registerDto.tenantName,
    });

    /* Create account */
    const hashedPassword = await hash(registerDto.password, 10);
    const newUser = await this.accountService.create({
      ...registerDto,
      role: UserRole.ADMIN,
      password: hashedPassword,
    });

    /* Create account and tenant relationship */
    await this.accountService.createAccountTenant(
      newUser.userId,
      newTenant.tenantCode,
    );

    /* Create refresh and access token */
    const refreshToken = await this.refreshTokenService.generateRefreshToken(
      newUser.userId,
    );
    return {
      accessToken: this.jwtService.sign({
        userId: newUser.userId,
        role: newUser.role,
      }),
      refreshToken: refreshToken,
    };
  }

  async registerPoc(
    registerDto: AuthPocRegisterDto,
  ): Promise<AuthLoginResponseDto> {
    // Check if email already exists
    const existingUser = await this.accountService
      .findByEmail(registerDto.email)
      .catch(() => null);
    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    // Validate event code here if needed
    const isEventCodeValid = await this.eventService.validateEventCode(
      registerDto.eventCode,
    );
    if (!isEventCodeValid) {
      throw new BadRequestException('Event code is not valid!');
    }

    // Validate point of checkin code here if needed
    const isPointCodeValid = await this.pocService.validatePointCode(
      registerDto.eventCode,
      registerDto.pointCode,
    );
    if (!isPointCodeValid) {
      throw new BadRequestException('Point of checkin code is not valid!');
    }

    // Hash password
    const hashedPassword = await hash(registerDto.password, 10);

    // Create account
    const newUser = await this.accountService.create({
      ...registerDto,
      role: UserRole.POC,
      password: hashedPassword,
    });

    await this.pocService.updatePocManager(
      registerDto.eventCode,
      registerDto.pointCode,
      newUser.userId,
    );

    // Create refresh token
    const refreshToken = await this.refreshTokenService.generateRefreshToken(
      newUser.userId,
    );

    // Generate JWT token
    return {
      accessToken: this.jwtService.sign({
        userId: newUser.userId,
        role: newUser.role,
      }),
      refreshToken: refreshToken,
      pointCode: registerDto.pointCode,
      eventCode: registerDto.eventCode,
    };
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.accountService.findByEmail(email);
    if (user && (await compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async refreshAccessToken(
    refreshToken: string,
  ): Promise<{ accessToken: string }> {
    // Validate refresh token
    const payload =
      await this.refreshTokenService.validateRefreshToken(refreshToken);

    if (!payload) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Get user information
    const user = await this.accountService.findById(payload.userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    // Generate new access token
    const accessToken = this.jwtService.sign(
      {
        userId: user.userId,
        role: user.role,
      },
      {
        secret: this.config.get<string>('JWT_SECRET'),
        expiresIn: this.config.get<string>('JWT_ACCESS_EXPIRATION') || '15m',
      },
    );

    // Return new tokens and user info
    return {
      accessToken,
    };
  }

  async logout(refreshToken: string): Promise<{ success: boolean }> {
    await this.refreshTokenService.revokeRefreshToken(refreshToken);
    return { success: true };
  }

  async logoutAll(userId: string): Promise<{ success: boolean }> {
    await this.refreshTokenService.revokeAllUserTokens(userId);
    return { success: true };
  }

  async getUserSessions(userId: string): Promise<any[]> {
    const tokens = await this.refreshTokenService.getUserTokens(userId);
    return tokens.map((token) => ({
      id: token.id,
      deviceInfo: token.deviceInfo,
      createdAt: token.createdAt,
      expiresAt: token.expiresAt,
    }));
  }

  async revokeSession(
    userId: string,
    tokenId: string,
  ): Promise<{ success: boolean }> {
    const token = await this.refreshTokenService.getUserTokens(userId);
    const validToken = token.find((t) => t.id === tokenId);

    if (!validToken) {
      throw new NotFoundException('Session not found');
    }

    await this.refreshTokenService.revokeRefreshToken(validToken.refreshToken);
    return { success: true };
  }

  async requestResetPassword(requestResetPasswordDto: RequestResetPassword) {
    const account = await this.accountService.findByEmail(
      requestResetPasswordDto.email,
    );

    if (account) {
      const otp = await this.otpService.generateOtp(account.userId); // generate and store OTP
      await this.mailService.sendOtpMail(account, otp);
    }

    return {
      message:
        'If an account with that email exists, we have sent a reset code to your email.',
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { userId, resetToken, password } = resetPasswordDto;
    const resetTokenRecord = await this.resetTokenRepository.findOne({
      where: { userId: userId, expriedAt: MoreThan(new Date()) },
    });

    if (!resetTokenRecord) {
      throw new BadRequestException('Invalid or expired code');
    }

    const isValidResetToken = await compare(
      resetToken,
      resetTokenRecord.hashedResetToken,
    );

    if (!isValidResetToken) {
      throw new BadRequestException('Invalid or expired code');
    }

    await this.resetTokenRepository.remove(resetTokenRecord);

    // Update password
    const hashedPassword = await hash(password, 10);
    const account = await this.accountService.updateAccount(userId, {
      userId: userId,
      password: hashedPassword,
    });

    // Revoke all sessions
    await this.refreshTokenService.revokeAllUserTokens(userId);

    // send confirmation email
    await this.mailService.sendPasswordChangedMail(account);
  }
}
