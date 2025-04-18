/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { GuestResponse } from 'src/guest/dto/get-guests-response.dto';

@WebSocketGateway({
  cors: process.env.CLIENT_URL || 'https://localhost:3000',
})
export class SocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('SocketGateway');

  afterInit() {
    this.logger.log('WebSocket Gateway initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join_room')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() eventCode: string,
  ) {
    await client.join(eventCode);
    this.logger.log(`Client ${client.id} joined room: ${eventCode}`);

    return { success: true, message: `Joined room ${eventCode}` };
  }

  @SubscribeMessage('leave_room')
  async handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() eventCode: string,
  ) {
    await client.leave(eventCode);
    this.logger.log(`Client ${client.id} left room: ${eventCode}`);
    return { success: true, message: `Left room ${eventCode}` };
  }

  @SubscribeMessage('new_checkin')
  handleNewCheckin(
    @ConnectedSocket() client: Socket,
    @MessageBody() checkinData: GuestResponse,
  ) {
    client
      .to(checkinData.guestInfo.eventCode)
      .emit('new_checkin_received', checkinData);
    this.logger.log(`New checkin: ${JSON.stringify(checkinData)}`);
    return { success: true, message: `New checkin received` };
  }
}
