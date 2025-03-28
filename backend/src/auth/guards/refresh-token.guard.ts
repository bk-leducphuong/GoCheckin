import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { RefreshTokenService } from '../refresh-token.service';

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  constructor(private refreshTokenService: RefreshTokenService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const refreshToken = request.body.refreshToken;

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }

    const payload =
      await this.refreshTokenService.validateRefreshToken(refreshToken);
    if (!payload) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Attach user to request
    request.user = payload;
    return true;
  }
}
