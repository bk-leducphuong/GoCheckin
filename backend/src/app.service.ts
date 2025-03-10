import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(private configService: ConfigService) {}

  getHello(): string {
    return (
      this.configService.get<string>('TEST_STRING') ||
      'loading .env.development file failed!'
    );
  }
}
