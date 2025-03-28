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
  ) {}

  async adminLogin(loginDto: AuthLoginDto): Promise<AuthLoginResponseDto> {
    try {
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
      const refreshToken = await this.refreshTokenService.createRefreshToken(
        user.userId,
      );

      return {
        accessToken: this.jwtService.sign({
          userId: user.userId,
        }),
        refreshToken: refreshToken,
        user: {
          userId: user.userId,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new UnauthorizedException('User not found');
      }
      throw error;
    }
  }

  async pocLogin(loginDto: AuthLoginDto): Promise<AuthLoginResponseDto> {
    try {
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
      const refreshToken = await this.refreshTokenService.createRefreshToken(
        user.userId,
      );

      return {
        accessToken: this.jwtService.sign({
          userId: user.userId,
        }),
        refreshToken: refreshToken,
        user: {
          userId: user.userId,
          username: user.username,
          email: user.email,
          role: user.role,
        },
        pocId: poc.pocId,
        eventCode: poc.eventCode,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new UnauthorizedException('User not found');
      }
      throw error;
    }
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

    // Validate admin-specific requirements
    if (!registerDto.phoneNumber) {
      throw new BadRequestException(
        'Phone number is required for admin registration',
      );
    }

    // Validate tenant code
    const tenant = await this.tenantService.findByCodeOrName(
      registerDto.tenantCode,
      registerDto.tenantName,
    );
    if (tenant) {
      throw new BadRequestException('Tenant already exists');
    }

    // Create tenant
    await this.tenantService.createTenant({
      tenantCode: registerDto.tenantCode,
      tenantName: registerDto.tenantName,
    });

    // Hash password
    const hashedPassword = await hash(registerDto.password, 10);

    // Create account
    const newUser = await this.accountService.create({
      ...registerDto,
      role: UserRole.ADMIN,
      password: hashedPassword,
    });

    // Create refresh token
    const refreshToken = await this.refreshTokenService.createRefreshToken(
      newUser.userId,
    );

    // Generate JWT token
    return {
      accessToken: this.jwtService.sign({
        userId: newUser.userId,
      }),
      refreshToken: refreshToken,
      user: {
        userId: newUser.userId,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
      },
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

    // Update POC
    const poc = await this.pocService.getPocByCode(
      registerDto.eventCode,
      registerDto.pointCode,
    );
    await this.pocService.update(poc.pocId, {
      userId: newUser.userId,
    });

    // Create refresh token
    const refreshToken = await this.refreshTokenService.createRefreshToken(
      newUser.userId,
    );

    // Generate JWT token
    return {
      accessToken: this.jwtService.sign({
        userId: newUser.userId,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
      }),
      refreshToken: refreshToken,
      user: {
        userId: newUser.userId,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
      },
      pocId: poc.pocId,
      eventCode: poc.eventCode,
    };
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (user && (await compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async refreshTokens(refreshToken: string) {
    const payload = await this.refreshTokenService.validateRefreshToken(refreshToken);
    
    if (!payload) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Generate new access token
    const accessToken = this.jwtService.sign(
      { email: user.email, sub: user.id, role: user.role },
      {
        secret: this.config.get('JWT_SECRET'),
        expiresIn: '15m',
      },
    );

    // Generate new refresh token
    const newRefreshToken = await this.refreshTokenService.createRefreshToken(
      user.id,
      'Refreshed',
    );

    // Revoke old refresh token
    await this.refreshTokenService.revokeRefreshToken(refreshToken);

    return {
      access_token: accessToken,
      refresh_token: newRefreshToken,
    };
  }

  async logout(refreshToken: string) {
    await this.refreshTokenService.revokeRefreshToken(refreshToken);
  }

  async logoutAll(userId: string) {
    await this.refreshTokenService.revokeAllUserTokens(userId);
  }
}
