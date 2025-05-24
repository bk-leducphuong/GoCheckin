import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { GoogleTokenResponse } from './dto/google-token-response';
import { GoogleUserInfo } from './dto/google-user-info';

@Injectable()
export class GoogleService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async getAccessToken(code: string) {
    const response = await this.httpService.axiosRef.post(
      'https://oauth2.googleapis.com/token',
      {
        code,
        client_id: this.configService.get('GOOGLE_CLIENT_ID'),
        client_secret: this.configService.get('GOOGLE_CLIENT_SECRET'),
        redirect_uri: this.configService.get('GOOGLE_REDIRECT_URI'),
        grant_type: 'authorization_code',
      },
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      },
    );

    return response.data as GoogleTokenResponse;
  }

  async getUserInfo(accessToken: string) {
    const response = await this.httpService.axiosRef.get(
      'https://www.googleapis.com/oauth2/v3/userinfo',
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );

    return response.data as GoogleUserInfo;
  }
}
