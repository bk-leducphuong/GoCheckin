import { Injectable, Logger } from '@nestjs/common';
import { Server } from 'socket.io';
import { GuestResponse } from 'src/guest/dto/get-guests-response.dto';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class SocketService {
  constructor(private readonly redisService: RedisService) {}

  private adminList: { [eventCode: string]: string } = {};
  private logger: Logger = new Logger('SocketService');

  registerAdmin(clientId: string, eventCode: string): void {
    this.adminList[eventCode] = clientId;
    this.logger.log(`Admin ${clientId} registered for event ${eventCode}`);
  }

  unregisterAdmin(clientId: string, eventCode: string): void {
    delete this.adminList[eventCode];
    this.logger.log(`Admin ${clientId} unregistered for event ${eventCode}`);
  }

  async handleHeartbeat(
    server: Server,
    data: { eventCode: string; pointCode: string },
  ): Promise<void> {
    const expiryTime = Date.now() + 1000 * 60 * 1; // 1 minute
    await this.redisService.hset(
      data.eventCode,
      data.pointCode,
      expiryTime.toString(),
    );
    this.logger.log(`Heartbeat received from POC ${data.pointCode}`);
  }

  handleNewCheckin(
    server: Server,
    checkinData: GuestResponse,
  ): { success: boolean; message: string } {
    const eventCode = checkinData.guestInfo.eventCode;
    const adminSocketId = this.adminList[eventCode];
    if (adminSocketId) {
      server.to(adminSocketId).emit('new_checkin_received', checkinData);
    }
    this.logger.log(`New checkin: ${JSON.stringify(checkinData)}`);
    return { success: true, message: `New checkin received` };
  }

  async handleExpiredHeartbeats(server: Server) {
    const currentTime = Date.now();

    for (const eventCode of Object.keys(this.adminList)) {
      const pointCodes = await this.redisService.hkeys(eventCode);
      const updatedPointCodes: string[] = [];
      for (const pointCode of pointCodes) {
        const expiryTime = await this.redisService.hget(eventCode, pointCode);
        if (expiryTime && currentTime > parseInt(expiryTime)) {
          await this.redisService.hdel(eventCode, pointCode);
        } else {
          updatedPointCodes.push(pointCode);
        }
      }

      server.to(this.adminList[eventCode]).emit('poc_status_update', {
        eventCode,
        pointCodes: updatedPointCodes,
      });

      this.logger.log(`Updated POC status for event ${eventCode}`);
    }
  }
}
