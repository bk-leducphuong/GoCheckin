import { Injectable, Logger } from '@nestjs/common';
import { Server } from 'socket.io';
import { GuestResponse } from 'src/guest/dto/get-guests-response.dto';
import { SocketService } from '../socket.service';

@Injectable()
export class CheckinSocketHandler {
  private logger: Logger = new Logger('CheckinSocketHandler');

  constructor(private readonly socketService: SocketService) {}

  async handleHeartbeat(
    server: Server,
    data: { eventCode: string; pointCode: string },
  ): Promise<void> {
    await this.socketService.handleHeartbeat(server, data);
  }

  handleNewCheckin(
    server: Server,
    checkinData: GuestResponse,
  ): { success: boolean; message: string } {
    return this.socketService.handleNewCheckin(server, checkinData);
  }

  async handleExpiredHeartbeats(server: Server): Promise<void> {
    await this.socketService.handleExpiredHeartbeats(server);
  }
}
