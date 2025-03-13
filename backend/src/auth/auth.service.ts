import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthLoginDto } from './dto/auth-login.dto';
import { AuthLoginResponseDto } from './dto/login-response.dto';
import { AuthRegisterDto } from './dto/auth-register.dto';
import { compare, hash } from 'bcrypt';
import { AccountService } from 'src/account/account.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly accountService: AccountService,
  ) {}

  async login(loginDto: AuthLoginDto): Promise<AuthLoginResponseDto> {
    try {
      const user = await this.accountService.findByEmail(loginDto.email);
      const isValidPassword = await compare(loginDto.password, user.password);

      if (!isValidPassword) {
        throw new UnauthorizedException('Invalid password');
      }

      return {
        accessToken: this.jwtService.sign({
          userId: user.userId,
          email: user.email,
          role: user.role,
        }),
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new UnauthorizedException('User not found');
      }
      throw error;
    }
  }

  async register(registerDto: AuthRegisterDto): Promise<AuthLoginResponseDto> {
    // Check if email already exists
    const existingUser = await this.accountService
      .findByEmail(registerDto.email)
      .catch(() => null);
    if (existingUser) {
      throw new ConflictException('User already exist');
    }

    // Hash password
    const hashedPassword = await hash(registerDto.password, 10);

    // Create account
    const newUser = await this.accountService.create({
      ...registerDto,
      password: hashedPassword,
    });

    // Generate JWT token
    return {
      accessToken: this.jwtService.sign({
        userId: newUser.userId,
        email: newUser.email,
        role: newUser.role,
      }),
    };
  }
}
