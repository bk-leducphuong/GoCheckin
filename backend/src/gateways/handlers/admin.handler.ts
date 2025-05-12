import { Injectable, Logger } from '@nestjs/common';
import { SocketService } from '../socket.service';

@Injectable()
export class AdminSocketHandler {
  private logger: Logger = new Logger('AdminSocketHandler');

  constructor(private readonly socketService: SocketService) {}

  registerAdmin(clientId: string, eventCode: string): void {
    this.socketService.registerAdmin(clientId, eventCode);
  }

  unregisterAdmin(clientId: string, eventCode: string): void {
    this.socketService.unregisterAdmin(clientId, eventCode);
  }
}
