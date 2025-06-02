import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { TokenRepository } from '../repositories/token.repository';
import { Token } from './entities/token.entity';
import { JwtPayload } from '../common/interfaces/jwt-payload.interface';

@Injectable()
export class RefreshTokenService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private readonly tokenRepository: TokenRepository,
  ) {}

  async generateRefreshToken(
    userId: string,
    deviceInfo: string = 'unknown',
  ): Promise<string> {
    try {
      await this.cleanupExpiredTokens();

      await this.tokenRepository.updateByUserIdAndDeviceInfo(
        userId,
        deviceInfo,
        { isRevoked: true },
      );

      // Generate JWT refresh token
      const refreshToken = this.jwtService.sign(
        { userId },
        {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
          expiresIn:
            this.configService.get<string>('JWT_REFRESH_EXPIRATION') || '7d',
        },
      );

      // Calculate expiration date
      const expiresIn =
        this.configService.get<string>('JWT_REFRESH_EXPIRATION') || '7d';
      const expiresAt = this.calculateExpirationDate(expiresIn);

      // Save the refresh token to the database
      await this.tokenRepository.saveByUserId(userId, {
        refreshToken,
        deviceInfo,
        expiresAt,
        isRevoked: false,
      });

      return refreshToken;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async validateRefreshToken(refreshToken: string): Promise<JwtPayload | null> {
    try {
      // Verify the token
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      // Check if token exists in database and is not expired or revoked
      const tokenEntity =
        await this.tokenRepository.findActiveToken(refreshToken);

      if (!tokenEntity) {
        return null;
      }

      return payload as JwtPayload;
    } catch (error) {
      console.error('Error validating refresh token:', error);
      return null;
    }
  }

  /**
   * Revoke all refresh tokens for a user
   */
  async revokeAllUserTokens(userId: string): Promise<void> {
    try {
      await this.tokenRepository.updateByUserId(userId, { isRevoked: true });
    } catch (error) {
      console.error('Error revoking all tokens for user:', error);
      throw error;
    }
  }

  /**
   * Clean up expired tokens
   */
  async cleanupExpiredTokens(): Promise<void> {
    try {
      await this.tokenRepository.deleteExpiredTokens();
    } catch (error) {
      console.error('Error cleaning up expired tokens:', error);
      throw error;
    }
  }

  /**
   * Get all active refresh tokens for a user
   */
  async getUserTokens(userId: string): Promise<Token[]> {
    try {
      return await this.tokenRepository.findByUserId(userId);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  /**
   * Helper method to calculate expiration date from string like "7d", "30m", etc.
   */
  private calculateExpirationDate(expiresIn: string): Date {
    const now = new Date();
    const milliseconds = this.parseExpiresIn(expiresIn);
    return new Date(now.getTime() + milliseconds);
  }

  /**
   * Helper method to parse expiration string to milliseconds
   */
  private parseExpiresIn(expiresIn: string): number {
    const unit = expiresIn.charAt(expiresIn.length - 1);
    const value = parseInt(expiresIn.slice(0, -1), 10);

    switch (unit) {
      case 's':
        return value * 1000; // seconds to milliseconds
      case 'm':
        return value * 60 * 1000; // minutes to milliseconds
      case 'h':
        return value * 60 * 60 * 1000; // hours to milliseconds
      case 'd':
        return value * 24 * 60 * 60 * 1000; // days to milliseconds
      default:
        return value;
    }
  }
}
