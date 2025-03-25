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

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly accountService: AccountService,
    private readonly eventService: EventService,
    private readonly tenantService: TenantService,
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

      return {
        accessToken: this.jwtService.sign({
          userId: user.userId,
          username: user.username,
          email: user.email,
          role: user.role,
        }),
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

      return {
        accessToken: this.jwtService.sign({
          userId: user.userId,
          username: user.username,
          email: user.email,
          role: user.role,
        }),
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

    // Generate JWT token
    return {
      accessToken: this.jwtService.sign({
        userId: newUser.userId,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
      }),
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

    // Validate POC-specific requirements
    if (!registerDto.eventCode) {
      throw new BadRequestException(
        'Event code is required for POC registration',
      );
    }

    // Validate event code here if needed
    const isEventCodeValid = await this.eventService.validateEventCode(
      registerDto.eventCode,
    );
    if (!isEventCodeValid) {
      throw new BadRequestException('Event code is not valid!');
    }

    // Hash password
    const hashedPassword = await hash(registerDto.password, 10);

    // Create account
    const newUser = await this.accountService.create({
      ...registerDto,
      role: UserRole.POC,
      password: hashedPassword,
    });

    // Generate JWT token
    return {
      accessToken: this.jwtService.sign({
        userId: newUser.userId,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
      }),
      user: {
        userId: newUser.userId,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
      },
    };
  }
}
