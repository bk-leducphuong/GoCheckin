import { Module } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';
import { SocketService } from './socket.service';
import { AdminSocketHandler } from './handlers/admin.handler';
import { CheckinSocketHandler } from './handlers/checkin.handler';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  imports: [RedisModule],
  providers: [
    SocketGateway,
    SocketService,
    AdminSocketHandler,
    CheckinSocketHandler,
  ],
  exports: [SocketService, AdminSocketHandler, CheckinSocketHandler],
})
export class SocketModule {}
