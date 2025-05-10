import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../../interfaces/jwt-payload.interface';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient();
    const token = this.extractTokenFromHeader(client);
    if (!token) {
      throw new WsException('No token provided');
    }

    try {
      const user = await this.validateToken(token);
      client.user = user;
      return true;
    } catch (error) {
      throw new WsException('Invalid token');
    }
  }

  private extractTokenFromHeader(client: any): string | undefined {
    // For initial handshake auth
    if (client.handshake?.auth?.token) {
      const authToken = client.handshake.auth.token;
      return authToken.startsWith('Bearer ')
        ? authToken.substring(7)
        : authToken;
    }

    return undefined;
  }

  private async validateToken(token: string): Promise<JwtPayload> {
    try {
      const payload = await this.jwtService.verifyAsync(token);
      return payload as JwtPayload;
    } catch (error) {
      throw new WsException('Invalid token');
    }
  }
}
