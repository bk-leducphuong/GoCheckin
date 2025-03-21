import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AuthLoginDto } from './dto/auth-login.dto';
import { AuthAdminRegisterDto } from './dto/auth-admin-register.dto';
import { AuthPocRegisterDto } from './dto/auth-poc-register.dto';
import { AuthLoginResponseDto } from './dto/login-response.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}

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
}
