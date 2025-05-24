import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  Param,
  UseGuards,
  Delete,
  UseInterceptors,
  UploadedFiles,
  ParseFilePipeBuilder,
  HttpStatus,
  Query,
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
import { EventStatus, EventType } from './entities/event.entity';
import { FilesInterceptor } from '@nestjs/platform-express';
import { EventConstraintsDto } from './dto/event-constraints';

@Controller('events')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Get('all')
  @Roles(UserRole.ADMIN, UserRole.POC)
  async getAllEventsByConstraints(
    @Query('status') status?: EventStatus,
    @Query('type') type?: EventType,
  ) {
    const constraints: EventConstraintsDto = {
      ...(status &&
        Object.values(EventStatus).includes(status) && { eventStatus: status }),
      ...(type &&
        Object.values(EventType).includes(type) && { eventType: type }),
    };

    return this.eventService.findEventsByConstraints(constraints);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  async getAllManagedEvents(@CurrentUser() user: JwtPayload) {
    return this.eventService.getAllManagedEvents(user);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  async createEvent(
    @CurrentUser() user: JwtPayload,
    @Body() createEventDto: CreateEventDto,
  ) {
    return this.eventService.createEvent(user, createEventDto);
  }

  @Get(':eventCode')
  async getEventByCode(@Param('eventCode') eventCode: string) {
    return await this.eventService.getEventByCode(eventCode);
  }

  @Put(':eventCode')
  @Roles(UserRole.ADMIN)
  async updateEvent(
    @Param('eventCode') eventCode: string,
    @Body() updateEventDto: UpdateEventDto,
  ) {
    return this.eventService.updateEvent(eventCode, updateEventDto);
  }

  @Get(':eventCode/status')
  async getEventStatus(@Param('eventCode') eventCode: string) {
    return this.eventService.getEventStatus(eventCode);
  }

  @Delete(':eventCode')
  @Roles(UserRole.ADMIN)
  async deleteEvent(@Param('eventCode') eventCode: string) {
    return this.eventService.removeEvent(eventCode);
  }

  @Post(':eventCode/images/upload')
  @Roles(UserRole.ADMIN)
  @UseInterceptors(FilesInterceptor('images'))
  uploadEventImages(
    @Param('eventCode') eventCode: string,
    @UploadedFiles(
      new ParseFilePipeBuilder()
        .addMaxSizeValidator({ maxSize: 5 * 1024 * 1024 })
        .addFileTypeValidator({ fileType: 'image/*' })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    images: Array<Express.Multer.File>,
  ) {
    return this.eventService.uploadEventImages(eventCode, images);
  }

  @Get(':eventCode/images')
  @Roles(UserRole.ADMIN)
  async getEventImages(@Param('eventCode') eventCode: string) {
    return await this.eventService.getEventImages(eventCode);
  }
}
