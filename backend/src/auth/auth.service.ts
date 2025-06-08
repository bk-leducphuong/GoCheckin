import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthLoginDto } from './dto/auth-login.dto';
import { AuthLoginResponseDto } from './dto/login-response.dto';
import { AuthAdminRegisterDto } from './dto/auth-admin-register.dto';
import { AuthPocRegisterDto } from './dto/auth-poc-register.dto';
import { compare, hash } from 'bcrypt';
import { Account, UserRole } from 'src/account/entities/account.entity';
import { ConfigService } from '@nestjs/config';
import { RefreshTokenService } from './refresh-token.service';
import { RequestResetPassword } from './dto/request-reset-password';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { MailService } from 'src/mail/mail.service';
import { OtpService } from './otp.service';
import { RefreshTokenResponseDto } from './dto/refresh-token-response.dto';
import { GoogleAdminLoginDto } from './dto/google-admin-login.dto';
import { GoogleAdminRegisterDto } from './dto/google-admin-register.dto';
import { GooglePocLoginDto } from './dto/google-poc-login.dto';
import { GooglePocRegisterDto } from './dto/google-poc-register.dto';
import { GoogleService } from './google.service';
import { GoogleTokenResponse } from './dto/google-token-response';
import { GoogleUserInfo } from './dto/google-user-info';
import { MoreThan } from 'typeorm';
import {
  AccountRepository,
  ResetTokenRepository,
  TokenRepository,
  AccountTenantRepository,
  TenantRepository,
} from 'src/repositories';
import { DataSource } from 'typeorm';
import { Tenant } from 'src/tenant/entities/tenant.entity';
import { AccountTenant } from 'src/account/entities/account-tenant.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly refreshTokenService: RefreshTokenService,
    private readonly mailService: MailService,
    private readonly otpService: OtpService,
    private readonly resetTokenRepository: ResetTokenRepository,
    private readonly googleService: GoogleService,
    private readonly accountRepository: AccountRepository,
    private readonly tokenRepository: TokenRepository,
    private readonly accountTenantRepository: AccountTenantRepository,
    private readonly tenantRepository: TenantRepository,
    private readonly dataSource: DataSource,
  ) {}

  async adminLogin(loginDto: AuthLoginDto): Promise<AuthLoginResponseDto> {
    try {
      const user = await this.accountRepository.findOne({
        email: loginDto.email,
      });

      // Check if user is an admin
      if (!user || user.role !== UserRole.ADMIN) {
        throw new UnauthorizedException('Account is not valid');
      }

      const isValidPassword = await compare(loginDto.password, user.password);

      if (!isValidPassword) {
        throw new UnauthorizedException('Account is not valid');
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
        userId: user.userId,
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async pocLogin(loginDto: AuthLoginDto): Promise<AuthLoginResponseDto> {
    try {
      const user = await this.accountRepository.findOne({
        email: loginDto.email,
      });

      // Check if user is a POC
      if (!user || user.role !== UserRole.POC) {
        throw new UnauthorizedException('Account is not valid');
      }

      const isValidPassword = await compare(loginDto.password, user.password);

      if (!isValidPassword) {
        throw new UnauthorizedException('Account is not valid');
      }

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
        userId: user.userId,
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async registerAdmin(
    registerDto: AuthAdminRegisterDto,
  ): Promise<AuthLoginResponseDto> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const newTenant: Tenant = await queryRunner.manager.create('Tenant', {
        tenantCode: registerDto.tenantCode,
        tenantName: registerDto.tenantName,
      });
      await queryRunner.manager.save(newTenant);

      /* Create account */
      const hashedPassword = await hash(registerDto.password, 10);
      const newUser: Account = await queryRunner.manager.create('Account', {
        ...registerDto,
        role: UserRole.ADMIN,
        password: hashedPassword,
      });
      await queryRunner.manager.save(newUser);

      /* Create account and tenant relationship */
      const newAccountTenant: AccountTenant = await queryRunner.manager.create(
        'AccountTenant',
        {
          accountUserId: newUser.userId,
          tenantId: newTenant.tenantId,
        },
      );
      await queryRunner.manager.save(newAccountTenant);

      await queryRunner.commitTransaction();

      /* Create refresh and access token */
      const refreshToken = await this.refreshTokenService.generateRefreshToken(
        newUser.userId,
        registerDto.deviceInfo,
      );
      return {
        accessToken: this.jwtService.sign({
          userId: newUser.userId,
          role: newUser.role,
        }),
        refreshToken: refreshToken,
        userId: newUser.userId,
      };
    } catch (error) {
      console.log(error);
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async registerPoc(
    registerDto: AuthPocRegisterDto,
  ): Promise<AuthLoginResponseDto> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const hashedPassword = await hash(registerDto.password, 10);
      const newUser: Account = await queryRunner.manager.create('Account', {
        ...registerDto,
        role: UserRole.POC,
        password: hashedPassword,
      });
      await queryRunner.manager.save(newUser);

      await queryRunner.commitTransaction();

      const refreshToken = await this.refreshTokenService.generateRefreshToken(
        newUser.userId,
        registerDto.deviceInfo,
      );

      return {
        accessToken: this.jwtService.sign({
          userId: newUser.userId,
          role: newUser.role,
        }),
        refreshToken: refreshToken,
        userId: newUser.userId,
      };
    } catch (error) {
      console.log(error);
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async validateUser(email: string, password: string): Promise<any> {
    try {
      const user = await this.accountRepository.findOne({
        email: email,
      });
      if (user && (await compare(password, user.password))) {
        const { password, ...result } = user;
        return result;
      }
      return null;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async refreshAccessToken(
    refreshToken: string,
  ): Promise<RefreshTokenResponseDto> {
    try {
      const payload =
        await this.refreshTokenService.validateRefreshToken(refreshToken);

      if (!payload) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const accessToken = this.jwtService.sign(
        {
          userId: payload.userId,
          role: payload.role,
        },
        {
          secret: this.config.get<string>('JWT_SECRET'),
          expiresIn: this.config.get<string>('JWT_ACCESS_EXPIRATION') || '15m',
        },
      );

      return {
        accessToken,
        userId: payload.userId,
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async logout(refreshToken: string): Promise<{ success: boolean }> {
    try {
      await this.tokenRepository.update({ refreshToken }, { isRevoked: true });
      return { success: true };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async logoutAll(userId: string): Promise<{ success: boolean }> {
    try {
      await this.tokenRepository.update(
        { userId: userId },
        { isRevoked: true },
      );
      return { success: true };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getUserSessions(userId: string): Promise<any[]> {
    try {
      const tokens = await this.tokenRepository.findAll({
        userId: userId,
      });
      return tokens.map((token) => ({
        id: token.id,
        deviceInfo: token.deviceInfo,
        createdAt: token.createdAt,
        expiresAt: token.expiresAt,
      }));
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async revokeSession(
    userId: string,
    tokenId: string,
  ): Promise<{ success: boolean }> {
    try {
      const token = await this.tokenRepository.findAll({
        userId: userId,
      });
      const validToken = token.find((t) => t.id === tokenId);

      if (!validToken) {
        throw new NotFoundException('Session not found');
      }

      await this.tokenRepository.update(
        { refreshToken: validToken.refreshToken },
        { isRevoked: true },
      );
      return { success: true };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async requestResetPassword(requestResetPasswordDto: RequestResetPassword) {
    try {
      const account = await this.accountRepository.findOne({
        email: requestResetPasswordDto.email,
      });

      if (account) {
        const otp = await this.otpService.generateOtp(account.userId); // generate and store OTP
        await this.mailService.sendOtpMail(account, otp);
      }

      return {
        message:
          'If an account with that email exists, we have sent a reset code to your email.',
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    try {
      const { userId, resetToken, password } = resetPasswordDto;
      const resetTokenRecord = await this.resetTokenRepository.findOne({
        userId: userId,
        expriedAt: MoreThan(new Date()),
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
      await this.accountRepository.update(
        { userId: userId },
        {
          password: hashedPassword,
        },
      );

      // Revoke all sessions
      await this.tokenRepository.update(
        { userId: userId },
        { isRevoked: true },
      );

      // TODO: send confirmation email
      // await this.mailService.sendPasswordChangedMail(userId);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async googleAdminLogin(googleAdminLoginDto: GoogleAdminLoginDto) {
    try {
      // Exchange code for access token and refresh token
      const googleTokens: GoogleTokenResponse =
        await this.googleService.getAccessToken(googleAdminLoginDto.code);

      const userInfo: GoogleUserInfo = await this.googleService.getUserInfo(
        googleTokens.access_token,
      );

      // Check if user already exists
      const existingUser = await this.accountRepository.findOne({
        email: userInfo.email,
      });
      if (!existingUser || existingUser.role !== UserRole.ADMIN) {
        throw new UnauthorizedException('Account is not registered');
      }

      // Create refresh token
      const refreshToken = await this.refreshTokenService.generateRefreshToken(
        existingUser.userId,
        googleAdminLoginDto.deviceInfo,
      );

      return {
        accessToken: this.jwtService.sign({
          userId: existingUser.userId,
          role: existingUser.role,
        }),
        refreshToken: refreshToken,
        userId: existingUser.userId,
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async googleAdminRegister(googleAdminRegisterDto: GoogleAdminRegisterDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      // Exchange code for access token and refresh token
      const googleTokens: GoogleTokenResponse =
        await this.googleService.getAccessToken(googleAdminRegisterDto.code);

      // Get user info
      const userInfo: GoogleUserInfo = await this.googleService.getUserInfo(
        googleTokens.access_token,
      );

      /* Tenant creation */
      const newTenant: Tenant = await queryRunner.manager.create('Tenant', {
        tenantCode: googleAdminRegisterDto.tenantCode,
        tenantName: googleAdminRegisterDto.tenantName,
      });
      await queryRunner.manager.save(newTenant);

      /* Create account */
      const newUser: Account = await queryRunner.manager.create('Account', {
        role: UserRole.ADMIN,
        password: '',
        username: userInfo.given_name,
        email: userInfo.email,
        fullName: userInfo.name,
      });
      await queryRunner.manager.save(newUser);

      /* Create account and tenant relationship */
      const newAccountTenant: AccountTenant = await queryRunner.manager.create(
        'AccountTenant',
        {
          accountUserId: newUser.userId,
          tenantId: newTenant.tenantId,
        },
      );
      await queryRunner.manager.save(newAccountTenant);

      await queryRunner.commitTransaction();

      /* Create refresh and access token */
      const refreshToken = await this.refreshTokenService.generateRefreshToken(
        newUser.userId,
        googleAdminRegisterDto.deviceInfo,
      );
      return {
        accessToken: this.jwtService.sign({
          userId: newUser.userId,
          role: newUser.role,
        }),
        refreshToken: refreshToken,
        userId: newUser.userId,
      };
    } catch (error) {
      console.log(error);
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async googlePocLogin(googlePocLoginDto: GooglePocLoginDto) {
    try {
      // Exchange code for access token and refresh token
      const googleTokens: GoogleTokenResponse =
        await this.googleService.getAccessToken(googlePocLoginDto.code);

      // Get user info
      const userInfo: GoogleUserInfo = await this.googleService.getUserInfo(
        googleTokens.access_token,
      );

      // Check if user already exists
      const existingUser = await this.accountRepository.findOne({
        email: userInfo.email,
      });
      if (!existingUser || existingUser.role !== UserRole.POC) {
        throw new UnauthorizedException('Account is not registered');
      }

      // Create refresh token
      const refreshToken = await this.refreshTokenService.generateRefreshToken(
        existingUser.userId,
        googlePocLoginDto.deviceInfo,
      );

      return {
        accessToken: this.jwtService.sign({
          userId: existingUser.userId,
          role: existingUser.role,
        }),
        refreshToken: refreshToken,
        userId: existingUser.userId,
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async googlePocRegister(googlePocRegisterDto: GooglePocRegisterDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      // Exchange code for access token and refresh token
      const googleTokens: GoogleTokenResponse =
        await this.googleService.getAccessToken(googlePocRegisterDto.code);

      // Get user info
      const userInfo: GoogleUserInfo = await this.googleService.getUserInfo(
        googleTokens.access_token,
      );

      // Create user
      const newUser: Account = await queryRunner.manager.create('Account', {
        username: userInfo.given_name,
        email: userInfo.email,
        password: '',
        role: UserRole.POC,
        fullName: userInfo.name,
      });
      await queryRunner.manager.save(newUser);

      await queryRunner.commitTransaction();

      // Create refresh token
      const refreshToken = await this.refreshTokenService.generateRefreshToken(
        newUser.userId,
        googlePocRegisterDto.deviceInfo,
      );

      // Create access token
      const accessToken = this.jwtService.sign({
        userId: newUser.userId,
        role: newUser.role,
      });

      return {
        accessToken,
        refreshToken,
        userId: newUser.userId,
      };
    } catch (error) {
      console.log(error);
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
