import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Server } from 'socket.io';
import { GuestResponse } from 'src/guest/dto/get-guests-response.dto';

@Injectable()
export class SocketService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

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

  handleHeartbeat(
    server: Server,
    data: { eventCode: string; pointCode: string },
  ): void {
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
}
