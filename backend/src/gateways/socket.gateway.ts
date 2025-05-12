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
import { Injectable, Logger, UseGuards } from '@nestjs/common';
import { GuestResponse } from 'src/guest/dto/get-guests-response.dto';
import { WsJwtGuard } from 'src/common/guards/ws-guards/ws-jwt.guard';
import { WsRolesGuard } from 'src/common/guards/ws-guards/ws-roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/account/entities/account.entity';
import { AdminSocketHandler } from './handlers/admin.handler';
import { CheckinSocketHandler } from './handlers/checkin.handler';
import { Cron, CronExpression } from '@nestjs/schedule';

@WebSocketGateway({
  cors: process.env.CLIENT_URL || 'https://localhost:3000',
})
@UseGuards(WsJwtGuard, WsRolesGuard)
@Injectable()
export class SocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('SocketGateway');

  constructor(
    private readonly adminHandler: AdminSocketHandler,
    private readonly checkinHandler: CheckinSocketHandler,
  ) {}

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
    this.adminHandler.registerAdmin(client.id, eventCode);
  }

  @Roles(UserRole.ADMIN)
  @SubscribeMessage('unregister_admin')
  handleUnregisterAdmin(
    @ConnectedSocket() client: Socket,
    @MessageBody() eventCode: string,
  ) {
    this.adminHandler.unregisterAdmin(client.id, eventCode);
  }

  @Roles(UserRole.POC)
  @SubscribeMessage('heartbeat')
  async handleHeartbeat(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { eventCode: string; pointCode: string },
  ) {
    await this.checkinHandler.handleHeartbeat(this.server, data);
  }

  @Roles(UserRole.POC)
  @SubscribeMessage('new_checkin')
  handleNewCheckin(
    @ConnectedSocket() client: Socket,
    @MessageBody() checkinData: GuestResponse,
  ) {
    return this.checkinHandler.handleNewCheckin(this.server, checkinData);
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async handleExpiredHeartbeats() {
    await this.checkinHandler.handleExpiredHeartbeats(this.server);
  }
}
