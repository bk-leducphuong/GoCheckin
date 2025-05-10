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
import { Logger, UseGuards } from '@nestjs/common';
import { GuestResponse } from 'src/guest/dto/get-guests-response.dto';
import { WsJwtGuard } from 'src/common/guards/ws-guards/ws-jwt.guard';
import { WsRolesGuard } from 'src/common/guards/ws-guards/ws-roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/account/entities/account.entity';
@WebSocketGateway({
  cors: process.env.CLIENT_URL || 'https://localhost:3000',
})
@UseGuards(WsJwtGuard, WsRolesGuard)
export class SocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private adminList: { [eventCode: string]: string } = {};

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

  @Roles(UserRole.ADMIN)
  @SubscribeMessage('register_admin')
  handleRegisterAdmin(
    @ConnectedSocket() client: Socket,
    @MessageBody() eventCode: string,
  ) {
    this.adminList[eventCode] = client.id;
    this.logger.log(`Admin ${client.id} registered for event ${eventCode}`);
  }

  @Roles(UserRole.ADMIN)
  @SubscribeMessage('unregister_admin')
  handleUnregisterAdmin(
    @ConnectedSocket() client: Socket,
    @MessageBody() eventCode: string,
  ) {
    delete this.adminList[eventCode];
    this.logger.log(`Admin ${client.id} unregistered for event ${eventCode}`);
  }

  @Roles(UserRole.POC)
  @SubscribeMessage('connect_to_admin')
  handleConnectToAdmin(
    @MessageBody() data: { eventCode: string; pointCode: string },
  ) {
    const adminSocketId = this.adminList[data.eventCode];
    if (adminSocketId) {
      this.server.to(adminSocketId).emit('poc_connected', data);
    }

    this.logger.log(
      `Poc ${data.pointCode} connected to event ${data.eventCode}`,
    );
  }

  @Roles(UserRole.POC)
  @SubscribeMessage('disconnect_from_admin')
  handleDisconnectFromAdmin(
    @MessageBody() data: { eventCode: string; pointCode: string },
  ) {
    const adminSocketId = this.adminList[data.eventCode];
    if (adminSocketId) {
      this.server.to(adminSocketId).emit('poc_disconnected', data);
    }

    this.logger.log(
      `Poc ${data.pointCode} disconnected from event ${data.eventCode}`,
    );
  }

  @Roles(UserRole.POC)
  @SubscribeMessage('new_checkin')
  handleNewCheckin(
    @ConnectedSocket() client: Socket,
    @MessageBody() checkinData: GuestResponse,
  ) {
    const eventCode = checkinData.guestInfo.eventCode;
    const adminSocketId = this.adminList[eventCode];
    if (adminSocketId) {
      this.server.to(adminSocketId).emit('new_checkin_received', checkinData);
    }
    this.logger.log(`New checkin: ${JSON.stringify(checkinData)}`);
    return { success: true, message: `New checkin received` };
  }
}
