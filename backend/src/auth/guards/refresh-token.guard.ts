import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { RefreshTokenService } from '../refresh-token.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  constructor(
    private refreshTokenService: RefreshTokenService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const refreshToken = this.extractTokenFromRequest(request);

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }

    try {
      // First verify the token format
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      // Then validate against the database
      const validToken =
        await this.refreshTokenService.validateRefreshToken(refreshToken);

      if (!validToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Attach user to request
      request.user = payload;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private extractTokenFromRequest(request: any): string | undefined {
    // Try to get from body first
    if (request.body && request.body.refreshToken) {
      return request.body.refreshToken;
    }

    // Then try from headers
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    // Then try from cookies if using cookies
    if (request.cookies && request.cookies.refresh_token) {
      return request.cookies.refresh_token;
    }

    return undefined;
  }
}
