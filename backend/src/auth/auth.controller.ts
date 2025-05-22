import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  UseGuards,
  Get,
  Delete,
  Param,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AuthLoginDto } from './dto/auth-login.dto';
import { AuthAdminRegisterDto } from './dto/auth-admin-register.dto';
import { AuthPocRegisterDto } from './dto/auth-poc-register.dto';
import { AuthLoginResponseDto } from './dto/login-response.dto';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { JwtPayload } from '../common/interfaces/jwt-payload.interface';
import { RequestResetPassword } from './dto/request-reset-password';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { OtpService } from './otp.service';
import { UserRole } from 'src/account/entities/account.entity';
import { GoogleAdminLoginDto } from './dto/google-admin-login.dto';
import { GoogleAdminRegisterDto } from './dto/google-admin-register.dto';
import { GooglePocLoginDto } from './dto/google-poc-login.dto';
import { GooglePocRegisterDto } from './dto/google-poc-register.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly otpService: OtpService,
  ) {}

  @ApiOperation({ summary: 'Admin login' })
  @ApiResponse({
    status: 200,
    description: 'Successful admin login',
    type: AuthLoginResponseDto,
  })
  @HttpCode(HttpStatus.OK)
  @Post('admin/login')
  adminLogin(@Body() loginDto: AuthLoginDto): Promise<AuthLoginResponseDto> {
    return this.authService.adminLogin(loginDto);
  }

  @ApiOperation({ summary: 'POC login' })
  @ApiResponse({
    status: 200,
    description: 'Successful POC login',
    type: AuthLoginResponseDto,
  })
  @HttpCode(HttpStatus.OK)
  @Post('poc/login')
  pocLogin(@Body() loginDto: AuthLoginDto): Promise<AuthLoginResponseDto> {
    return this.authService.pocLogin(loginDto);
  }

  @ApiOperation({ summary: 'Admin registration' })
  @ApiResponse({
    status: 201,
    description: 'Successful admin registration',
    type: AuthLoginResponseDto,
  })
  @Post('admin/register')
  adminRegister(
    @Body() registerDto: AuthAdminRegisterDto,
  ): Promise<AuthLoginResponseDto> {
    return this.authService.registerAdmin(registerDto);
  }

  @ApiOperation({ summary: 'POC registration' })
  @ApiResponse({
    status: 201,
    description: 'Successful POC registration',
    type: AuthLoginResponseDto,
  })
  @Post('poc/register')
  pocRegister(
    @Body() registerDto: AuthPocRegisterDto,
  ): Promise<AuthLoginResponseDto> {
    return this.authService.registerPoc(registerDto);
  }

  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({
    status: 200,
    description: 'New access token generated',
    type: AuthLoginResponseDto,
  })
  @Post('refresh-access-token')
  @UseGuards(RefreshTokenGuard)
  async refreshAccessToken(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshAccessToken(refreshToken);
  }

  @ApiOperation({ summary: 'Logout (revoke refresh token)' })
  @ApiResponse({
    status: 200,
    description: 'Successfully logged out',
    schema: {
      properties: {
        success: {
          type: 'boolean',
          example: true,
        },
      },
    },
  })
  @Post('logout')
  async logout(@Body('refreshToken') refreshToken: string) {
    return this.authService.logout(refreshToken);
  }

  @ApiOperation({ summary: 'Logout from all devices' })
  @ApiResponse({
    status: 200,
    description: 'Successfully logged out from all devices',
    schema: {
      properties: {
        success: {
          type: 'boolean',
          example: true,
        },
      },
    },
  })
  @Post('logout-all')
  @UseGuards(JwtAuthGuard)
  async logoutAll(@CurrentUser() user: JwtPayload) {
    return this.authService.logoutAll(user.userId);
  }

  @ApiOperation({ summary: 'Verify token validity' })
  @ApiResponse({
    status: 200,
    description: 'Token is valid',
    schema: {
      properties: {
        valid: {
          type: 'boolean',
          example: true,
        },
        user: {
          type: 'object',
        },
      },
    },
  })
  @Post('verify-access-token')
  @UseGuards(JwtAuthGuard)
  verifyToken(@CurrentUser() user: JwtPayload, @Body() role: UserRole) {
    if (role === user.role) {
      return {
        valid: true,
        userId: user.userId,
      };
    } else {
      return {
        valid: false,
        userId: null,
      };
    }
  }

  @ApiOperation({ summary: 'Get all active sessions for current user' })
  @ApiResponse({
    status: 200,
    description: 'List of active sessions',
  })
  @ApiBearerAuth()
  @Get('sessions')
  @UseGuards(JwtAuthGuard)
  async getSessions(@CurrentUser() user: JwtPayload) {
    return this.authService.getUserSessions(user.userId);
  }

  @ApiOperation({ summary: 'Revoke a specific session' })
  @ApiResponse({
    status: 200,
    description: 'Session successfully revoked',
    schema: {
      properties: {
        success: {
          type: 'boolean',
          example: true,
        },
      },
    },
  })
  @ApiBearerAuth()
  @Delete('sessions/:id')
  @UseGuards(JwtAuthGuard)
  async revokeSession(
    @CurrentUser() user: JwtPayload,
    @Param('id') tokenId: string,
  ) {
    return this.authService.revokeSession(user.userId, tokenId);
  }

  @Post('request-reset-password')
  requestResetPassword(@Body() requestResetPasswordDto: RequestResetPassword) {
    return this.authService.requestResetPassword(requestResetPasswordDto);
  }

  @Post('reset-password')
  resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Post('verify-otp')
  verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.otpService.verifyOtp(verifyOtpDto);
  }

  @Post('admin/google/login')
  googleAdminLogin(@Body() googleAdminLoginDto: GoogleAdminLoginDto) {
    return this.authService.googleAdminLogin(googleAdminLoginDto);
  }

  @Post('admin/google/register')
  googleAdminRegister(@Body() googleAdminRegisterDto: GoogleAdminRegisterDto) {
    return this.authService.googleAdminRegister(googleAdminRegisterDto);
  }

  @Post('poc/google/login')
  googlePocLogin(@Body() googlePocLoginDto: GooglePocLoginDto) {
    return this.authService.googlePocLogin(googlePocLoginDto);
  }

  @Post('poc/google/register')
  googlePocRegister(@Body() googlePocRegisterDto: GooglePocRegisterDto) {
    return this.authService.googlePocRegister(googlePocRegisterDto);
  }
}
