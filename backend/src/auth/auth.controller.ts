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
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtPayload } from '../common/interfaces/jwt-payload.interface';
import { RequestResetPassword } from './dto/request-reset-password';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { OtpService } from './otp.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly service: AuthService,
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
    return this.service.adminLogin(loginDto);
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
    return this.service.pocLogin(loginDto);
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
    return this.service.registerAdmin(registerDto);
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
    return this.service.registerPoc(registerDto);
  }

  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({
    status: 200,
    description: 'New access token generated',
    type: AuthLoginResponseDto,
  })
  @Post('refresh')
  @UseGuards(RefreshTokenGuard)
  async refreshTokens(@Body('refreshToken') refreshToken: string) {
    return this.service.refreshTokens(refreshToken);
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
    return this.service.logout(refreshToken);
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
    return this.service.logoutAll(user.userId);
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
  @Post('verify')
  @UseGuards(JwtAuthGuard)
  verifyToken(@CurrentUser() user: JwtPayload) {
    return { valid: true, user };
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
    return this.service.getUserSessions(user.userId);
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
    return this.service.revokeSession(user.userId, tokenId);
  }

  @Post('request-reset-password')
  requestResetPassword(@Body() requestResetPasswordDto: RequestResetPassword) {
    return this.service.requestResetPassword(requestResetPasswordDto);
  }

  @Post('reset-password')
  resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.service.resetPassword(resetPasswordDto);
  }

  @Post('verify-otp')
  verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.otpService.verifyOtp(verifyOtpDto.userId, verifyOtpDto.otp);
  }
}
