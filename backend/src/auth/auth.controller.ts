import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthLoginDto } from './dto/auth-login.dto';
import { AuthRegisterDto } from './dto/auth-register.dto';
import { AuthLoginResponseDto } from './dto/login-response.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() loginDto: AuthLoginDto): Promise<AuthLoginResponseDto> {
    return this.service.validateLogin(loginDto);
  }

  @Post('register')
  register(
    @Body() registerDto: AuthRegisterDto,
  ): Promise<AuthLoginResponseDto> {
    return this.service.register(registerDto);
  }
}
