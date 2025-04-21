import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
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

  @Get()
  @Roles(UserRole.ADMIN, UserRole.TENANT)
  async getEvents(@CurrentUser() user: JwtPayload) {
    return this.eventService.findAll(user);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.TENANT)
  async createEvent(
    @CurrentUser() user: JwtPayload,
    @Body() createEventDto: CreateEventDto,
  ) {
    return this.eventService.create(user, createEventDto);
  }

  @Get(':eventCode')
  @Roles(UserRole.ADMIN, UserRole.TENANT)
  async getEventById(
    @CurrentUser() user: JwtPayload,
    @Param('eventCode') eventCode: string,
  ) {
    return await this.eventService.findOne(eventCode);
  }

  @Put(':eventCode')
  @Roles(UserRole.ADMIN, UserRole.TENANT)
  async updateEvent(
    @Param('eventCode') eventCode: string,
    @Body() updateEventDto: UpdateEventDto,
  ) {
    return this.eventService.update(eventCode, updateEventDto);
  }

  @Get(':eventCode/status')
  @Roles(UserRole.ADMIN, UserRole.TENANT)
  async getEventStatus(@Param('eventCode') eventCode: string) {
    return this.eventService.getEventStatus(eventCode);
  }
}
