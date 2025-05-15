import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { OtpService } from './otp.service';
import { AuthLoginDto } from './dto/auth-login.dto';
import { AuthLoginResponseDto } from './dto/login-response.dto';
import { UnauthorizedException } from '@nestjs/common';
// Add these imports to create mocks for the required services
import { AccountService } from 'src/account/account.service';
import { EventService } from 'src/event/event.service';
import { TenantService } from 'src/tenant/tenant.service';
import { PocService } from 'src/poc/poc.service';
import { RefreshTokenService } from './refresh-token.service';
import { MailService } from 'src/mail/mail.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ResetToken } from './entities/reset-token.entity';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  // Mock data
  const mockLoginDto: AuthLoginDto = {
    email: 'admin@example.com',
    password: 'password123',
    deviceInfo: 'Test Device',
  };

  const mockLoginResponse: AuthLoginResponseDto = {
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
    userId: 'user-123',
  };

  beforeEach(async () => {
    const mockAuthService = {
      adminLogin: jest.fn().mockImplementation((dto) => {
        if (
          dto.email === 'admin@example.com' &&
          dto.password === 'password123'
        ) {
          return Promise.resolve(mockLoginResponse);
        }
        return Promise.reject(new UnauthorizedException('Invalid credentials'));
      }),
    };

    const mockOtpService = {
      verifyOtp: jest.fn(),
    };

    // Add mock implementations for all the dependencies of AuthService
    const mockAccountService = {
      findByEmail: jest.fn(),
      create: jest.fn(),
      createAccountTenant: jest.fn(),
    };

    const mockEventService = { validateEventCode: jest.fn() };
    const mockTenantService = { createTenant: jest.fn() };
    const mockPocService = {
      validatePointCode: jest.fn(),
      updatePocManager: jest.fn(),
    };
    const mockRefreshTokenService = { generateRefreshToken: jest.fn() };
    const mockMailService = { sendEmail: jest.fn() };
    const mockJwtService = { sign: jest.fn() };
    const mockConfigService = { get: jest.fn() };
    const mockResetTokenRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: OtpService, useValue: mockOtpService },
        // Provide mocks for all required services
        { provide: AccountService, useValue: mockAccountService },
        { provide: EventService, useValue: mockEventService },
        { provide: TenantService, useValue: mockTenantService },
        { provide: PocService, useValue: mockPocService },
        { provide: RefreshTokenService, useValue: mockRefreshTokenService },
        { provide: MailService, useValue: mockMailService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
        {
          provide: getRepositoryToken(ResetToken),
          useValue: mockResetTokenRepository,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('adminLogin', () => {
    it('should return access token when credentials are valid', async () => {
      const result = await controller.adminLogin(mockLoginDto);

      expect(authService.adminLogin).toHaveBeenCalledWith(mockLoginDto);
      expect(result).toEqual(mockLoginResponse);
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(result.userId).toBeDefined();
    });

    it('should throw UnauthorizedException when credentials are invalid', async () => {
      const invalidLoginDto = { ...mockLoginDto, password: 'wrongpassword' };

      await expect(controller.adminLogin(invalidLoginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
