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
import { TenantService } from 'src/tenant/tenant.service';
import { ConfigService } from '@nestjs/config';
import { RefreshTokenService } from './refresh-token.service';
import { RequestResetPassword } from './dto/request-reset-password';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { MailService } from 'src/mail/mail.service';
import { OtpService } from './otp.service';
import { ResetToken } from './entities/reset-token.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { RefreshTokenResponseDto } from './dto/refresh-token-response.dto';
import { GoogleAdminLoginDto } from './dto/google-admin-login.dto';
import { GoogleAdminRegisterDto } from './dto/google-admin-register.dto';
import { GooglePocLoginDto } from './dto/google-poc-login.dto';
import { GooglePocRegisterDto } from './dto/google-poc-register.dto';
import { GoogleService } from './google.service';
import { AccountTenantService } from 'src/account/account-tenant.service';
import { GoogleTokenResponse } from './dto/google-token-response';
import { GoogleUserInfo } from './dto/google-user-info';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly accountService: AccountService,
    private readonly accountTenantService: AccountTenantService,
    private readonly tenantService: TenantService,
    private config: ConfigService,
    private refreshTokenService: RefreshTokenService,
    private mailService: MailService,
    private otpService: OtpService,
    @InjectRepository(ResetToken)
    private readonly resetTokenRepository: Repository<ResetToken>,
    private readonly googleService: GoogleService,
  ) {}

  async adminLogin(loginDto: AuthLoginDto): Promise<AuthLoginResponseDto> {
    try {
      const user = await this.accountService.findByEmail(loginDto.email);

      // Check if user is an admin
      if (user.role !== UserRole.ADMIN) {
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
      const user = await this.accountService.findByEmail(loginDto.email);

      // Check if user is a POC
      if (user.role !== UserRole.POC) {
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
    try {
      // Check if email already exists
      const existingUser = await this.accountService.findByEmail(
        registerDto.email,
      );
      if (existingUser) {
        throw new ConflictException('Account already exists');
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
      await this.accountTenantService.createAccountTenantRelation(
        newUser.userId,
        newTenant.tenantCode,
      );

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
      throw error;
    }
  }

  async registerPoc(
    registerDto: AuthPocRegisterDto,
  ): Promise<AuthLoginResponseDto> {
    try {
      const existingUser = await this.accountService.findByEmail(
        registerDto.email,
      );

      if (existingUser) {
        throw new ConflictException('Account already exists');
      }

      const hashedPassword = await hash(registerDto.password, 10);
      const newUser = await this.accountService.create({
        ...registerDto,
        role: UserRole.POC,
        password: hashedPassword,
      });

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
      throw error;
    }
  }

  async validateUser(email: string, password: string): Promise<any> {
    try {
      const user = await this.accountService.findByEmail(email);
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
      await this.refreshTokenService.revokeRefreshToken(refreshToken);
      return { success: true };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async logoutAll(userId: string): Promise<{ success: boolean }> {
    try {
      await this.refreshTokenService.revokeAllUserTokens(userId);
      return { success: true };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getUserSessions(userId: string): Promise<any[]> {
    try {
      const tokens = await this.refreshTokenService.getUserTokens(userId);
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
      const token = await this.refreshTokenService.getUserTokens(userId);
      const validToken = token.find((t) => t.id === tokenId);

      if (!validToken) {
        throw new NotFoundException('Session not found');
      }

      await this.refreshTokenService.revokeRefreshToken(
        validToken.refreshToken,
      );
      return { success: true };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async requestResetPassword(requestResetPasswordDto: RequestResetPassword) {
    try {
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
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    try {
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
      const existingUser = await this.accountService.findByEmail(
        userInfo.email,
      );
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
    try {
      // Exchange code for access token and refresh token
      const googleTokens: GoogleTokenResponse =
        await this.googleService.getAccessToken(googleAdminRegisterDto.code);

      // Get user info
      const userInfo: GoogleUserInfo = await this.googleService.getUserInfo(
        googleTokens.access_token,
      );

      // Check if email already exists
      const existingUser = await this.accountService.findByEmail(
        userInfo.email,
      );
      if (existingUser) {
        throw new ConflictException('Account is already registered');
      }

      /* Tenant creation */
      const newTenant = await this.tenantService.createTenant({
        tenantCode: googleAdminRegisterDto.tenantCode,
        tenantName: googleAdminRegisterDto.tenantName,
      });

      /* Create account */
      const newUser = await this.accountService.create({
        role: UserRole.ADMIN,
        password: '',
        username: userInfo.given_name,
        email: userInfo.email,
        fullName: userInfo.name,
      });

      /* Create account and tenant relationship */
      await this.accountTenantService.createAccountTenantRelation(
        newUser.userId,
        newTenant.tenantCode,
      );

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
      throw error;
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
      const existingUser = await this.accountService.findByEmail(
        userInfo.email,
      );
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
    try {
      // Exchange code for access token and refresh token
      const googleTokens: GoogleTokenResponse =
        await this.googleService.getAccessToken(googlePocRegisterDto.code);

      // Get user info
      const userInfo: GoogleUserInfo = await this.googleService.getUserInfo(
        googleTokens.access_token,
      );

      // Check if user already exists
      const existingUser = await this.accountService.findByEmail(
        userInfo.email,
      );
      if (existingUser) {
        throw new ConflictException('Account is already registered');
      }

      // Create user
      const newUser = await this.accountService.create({
        username: userInfo.given_name,
        email: userInfo.email,
        password: '',
        role: UserRole.POC,
        fullName: userInfo.name,
      });

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
      throw error;
    }
  }
}
