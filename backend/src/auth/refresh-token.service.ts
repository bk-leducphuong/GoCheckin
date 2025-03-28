import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RefreshToken } from './entities/token.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class RefreshTokenService {
  constructor(
    @InjectRepository(RefreshToken)
    private tokenRepositoty: Repository<RefreshToken>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async createRefreshToken(userId: string): Promise<string> {
    const refreshToken = this.jwtService.sign(
      { userId },
      {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN'), // Refresh token expires in 7 days
      },
    );

    // Check if token already exists
    const existingToken = await this.tokenRepositoty.findOne({
      where: {
        userId: userId,
      },
    });

    if (existingToken) {
      await this.tokenRepositoty.update(
        {
          userId: userId,
        },
        {
          refreshToken: refreshToken,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        },
      );
    } else {
      const newToken = this.tokenRepositoty.create({
        refreshToken: refreshToken,
        userId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      });
      await this.tokenRepositoty.save(newToken);
    }

    return refreshToken;
  }

  async validateRefreshToken(token: string): Promise<any> {
    try {
      // Verify the token
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      // Check if token exists in database and is not expired
      const storedToken = await this.tokenRepositoty.findOne({
        where: {
          refreshToken: token,
          expiresAt: {
            gt: new Date(),
          },
        },
      });

      if (!storedToken) {
        return null;
      }

      return payload;
    } catch (error) {
      return null;
    }
  }

  async revokeRefreshToken(token: string) {
    await this.tokenRepositoty.delete({
      where: { refreshToken: token },
    });
  }

  async revokeAllUserTokens(userId: string) {
    await this.tokenRepositoty.delete({
      where: { userId },
    });
  }
}
