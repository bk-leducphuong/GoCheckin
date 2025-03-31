import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UnauthorizedException,
  ParseUUIDPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/user.decorator';
import { JwtPayload } from '../common/interfaces/jwt-payload.interface';
import { UserRole } from '../account/entities/account.entity';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Controller('events')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EventController {
  constructor(private readonly eventService: EventService) {}

  // @Get()
  // @Roles(UserRole.ADMIN, UserRole.TENANT)
  // async getEvents(
  //   @CurrentUser() user: JwtPayload,
  //   @Query('status') status?: string,
  //   @Query('tenantCode') tenantCode?: string,
  // ) {
  //   // Admin can see all events, tenants can only see their own events
  //   if (
  //     user.role === UserRole.TENANT &&
  //     (!tenantCode || tenantCode !== user.tenantCode)
  //   ) {
  //     tenantCode = user.tenantCode; // Force tenant to only see their events
  //   }
  //   return this.eventService.findAll(status, tenantCode);
  // }

  // @Post()
  // @Roles(UserRole.ADMIN, UserRole.TENANT)
  // async createEvent(
  //   @CurrentUser() user: JwtPayload,
  //   @Body() createEventDto: CreateEventDto,
  // ) {
  //   // Tenants can only create events for their own tenant code
  //   if (
  //     user.role === UserRole.TENANT &&
  //     createEventDto.tenantCode !== user.tenantCode
  //   ) {
  //     throw new UnauthorizedException(
  //       'You can only create events for your own tenant',
  //     );
  //   }
  //   return this.eventService.create(createEventDto);
  // }

  // @Get(':eventId')
  // @Roles(UserRole.ADMIN, UserRole.TENANT)
  // async getEventById(
  //   @CurrentUser() user: JwtPayload,
  //   @Param('eventId', ParseUUIDPipe) eventId: string,
  // ) {
  //   const event = await this.eventService.findOne(eventId);
  //   // Tenants can only view their own events
  //   if (user.role === UserRole.TENANT && event.tenantCode !== user.tenantCode) {
  //     throw new UnauthorizedException('You can only view your own events');
  //   }
  //   return event;
  // }

  // @Put(':eventId')
  // @Roles(UserRole.ADMIN, UserRole.TENANT)
  // async updateEvent(
  //   @CurrentUser() user: JwtPayload,
  //   @Param('eventId', ParseUUIDPipe) eventId: string,
  //   @Body() updateEventDto: UpdateEventDto,
  // ) {
  //   const event = await this.eventService.findOne(eventId);
  //   // Tenants can only update their own events
  //   if (user.role === UserRole.TENANT && event.tenantCode !== user.tenantCode) {
  //     throw new UnauthorizedException('You can only update your own events');
  //   }
  //   return this.eventService.update(eventId, updateEventDto);
  // }

  // @Delete(':eventId')
  // @Roles(UserRole.ADMIN, UserRole.TENANT)
  // async deleteEvent(
  //   @CurrentUser() user: JwtPayload,
  //   @Param('eventId', ParseUUIDPipe) eventId: string,
  // ) {
  //   const event = await this.eventService.findOne(eventId);
  //   // Tenants can only delete their own events
  //   if (user.role === UserRole.TENANT && event.tenantCode !== user.tenantCode) {
  //     throw new UnauthorizedException('You can only delete your own events');
  //   }
  //   return this.eventService.remove(eventId);
  // }
}
