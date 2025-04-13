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

@WebSocketGateway({
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000', // Your Next.js frontend URL
    credentials: true,
  },
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
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() eventCode: string,
  ) {
    client.join(eventCode);
    console.log(`Client ${client.id} joined room: ${eventCode}`);

    return { success: true, message: `Joined room ${eventCode}` };
  }

  @SubscribeMessage('leave_room')
  handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() eventCode: string,
  ) {
    client.leave(eventCode);
    console.log(`Client ${client.id} left room: ${eventCode}`);
    return { success: true, message: `Left room ${eventCode}` };
  }

  @SubscribeMessage('new_checkin')
  handleNewCheckin(
    @ConnectedSocket() client: Socket,
    @MessageBody() checkinData: any,
  ) {
    client.to(checkinData.eventCode).emit('new_checkin_received', checkinData);
    console.log(`New checkin: ${JSON.stringify(checkinData)}`);
    return { success: true, message: `New checkin received` };
  }
}
