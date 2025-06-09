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
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
  AuthLoginDto,
  AuthAdminRegisterDto,
  AuthPocRegisterDto,
  AuthLoginResponseDto,
  RefreshTokenResponseDto,
  RequestResetPassword,
  ResetPasswordDto,
  VerifyOtpDto,
  GoogleAdminLoginDto,
  GoogleAdminRegisterDto,
  GooglePocLoginDto,
  GooglePocRegisterDto,
} from './dto';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { JwtPayload } from '../common/interfaces/jwt-payload.interface';
import { OtpService } from './otp.service';
import { UserRole } from 'src/account/entities/account.entity';

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
    type: RefreshTokenResponseDto,
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
  verifyToken(@CurrentUser() user: JwtPayload, @Body('role') role: UserRole) {
    // console.log('Verify token', user, 'with role: ', role);
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
  @Delete('sessions/:id')
  @UseGuards(JwtAuthGuard)
  async revokeSession(
    @CurrentUser() user: JwtPayload,
    @Param('id') tokenId: string,
  ) {
    return this.authService.revokeSession(user.userId, tokenId);
  }

  @ApiOperation({ summary: 'Request reset password' })
  @ApiResponse({
    status: 200,
    description: 'Reset password request successful',
    schema: {
      properties: {
        message: {
          type: 'string',
          example: 'Reset password email sent',
        },
      },
    },
  })
  @Post('request-reset-password')
  requestResetPassword(@Body() requestResetPasswordDto: RequestResetPassword) {
    return this.authService.requestResetPassword(requestResetPasswordDto);
  }

  @ApiOperation({ summary: 'Reset password' })
  @ApiResponse({
    status: 200,
    description: 'Reset password successful',
  })
  @Post('reset-password')
  resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @ApiOperation({ summary: 'Verify OTP' })
  @ApiResponse({
    status: 200,
    description: 'OTP verified successfully',
    schema: {
      properties: {
        resetToken: {
          type: 'string',
        },
        userId: {
          type: 'string',
        },
      },
    },
  })
  @Post('verify-otp')
  verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.otpService.verifyOtp(verifyOtpDto);
  }

  @ApiOperation({ summary: 'Google admin login' })
  @ApiResponse({
    status: 200,
    description: 'Google admin login successful',
    type: AuthLoginResponseDto,
  })
  @Post('admin/google/login')
  googleAdminLogin(@Body() googleAdminLoginDto: GoogleAdminLoginDto) {
    return this.authService.googleAdminLogin(googleAdminLoginDto);
  }

  @ApiOperation({ summary: 'Google admin register' })
  @ApiResponse({
    status: 200,
    description: 'Google admin register successful',
    type: AuthLoginResponseDto,
  })
  @Post('admin/google/register')
  googleAdminRegister(@Body() googleAdminRegisterDto: GoogleAdminRegisterDto) {
    return this.authService.googleAdminRegister(googleAdminRegisterDto);
  }

  @ApiOperation({ summary: 'Google poc login' })
  @ApiResponse({
    status: 200,
    description: 'Google poc login successful',
    type: AuthLoginResponseDto,
  })
  @Post('poc/google/login')
  googlePocLogin(@Body() googlePocLoginDto: GooglePocLoginDto) {
    return this.authService.googlePocLogin(googlePocLoginDto);
  }

  @ApiOperation({ summary: 'Google poc register' })
  @ApiResponse({
    status: 200,
    description: 'Google poc register successful',
    type: AuthLoginResponseDto,
  })
  @Post('poc/google/register')
  googlePocRegister(@Body() googlePocRegisterDto: GooglePocRegisterDto) {
    return this.authService.googlePocRegister(googlePocRegisterDto);
  }
}
