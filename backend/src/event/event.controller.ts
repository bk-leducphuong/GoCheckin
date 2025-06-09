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
import { CreateEventDto, UpdateEventDto, EventConstraintsDto } from './dto';
import { EventStatus, EventType } from './entities/event.entity';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('events')
@Controller('events')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @ApiOperation({ summary: 'Get all events by constraints' })
  @ApiResponse({
    status: 200,
    description: 'Returns all events by constraints',
    type: [Event],
  })
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
  @ApiOperation({ summary: 'Get all managed events' })
  @ApiResponse({
    status: 200,
    description: 'Returns all managed events',
    type: [Event],
  })
  async getAllManagedEvents(@CurrentUser() user: JwtPayload) {
    return this.eventService.getAllManagedEvents(user);
  }

  @ApiOperation({ summary: 'Create event' })
  @ApiResponse({
    status: 200,
    description: 'Event created successfully',
    type: Event,
  })
  @Post()
  @Roles(UserRole.ADMIN)
  async createEvent(
    @CurrentUser() user: JwtPayload,
    @Body() createEventDto: CreateEventDto,
  ) {
    return this.eventService.createEvent(user, createEventDto);
  }

  @ApiOperation({ summary: 'Get event by code' })
  @ApiResponse({
    status: 200,
    description: 'Returns event by code',
    type: Event,
  })
  @Get(':eventCode')
  async getEventByCode(@Param('eventCode') eventCode: string) {
    return await this.eventService.getEventByCode(eventCode);
  }

  @ApiOperation({ summary: 'Update event' })
  @ApiResponse({
    status: 200,
    description: 'Event updated successfully',
    type: Event,
  })
  @Put(':eventCode')
  @Roles(UserRole.ADMIN)
  async updateEvent(
    @Param('eventCode') eventCode: string,
    @Body() updateEventDto: UpdateEventDto,
  ) {
    return this.eventService.updateEvent(eventCode, updateEventDto);
  }

  @ApiOperation({ summary: 'Get event status' })
  @ApiResponse({
    status: 200,
    description: 'Returns event status',
    schema: {
      properties: {
        status: {
          type: 'string',
          example: 'COMPLETED',
        },
      },
    },
  })
  @Get(':eventCode/status')
  async getEventStatus(@Param('eventCode') eventCode: string) {
    return this.eventService.getEventStatus(eventCode);
  }

  @ApiOperation({ summary: 'Delete event' })
  @ApiResponse({
    status: 200,
    description: 'Event deleted successfully',
  })
  @Delete(':eventCode')
  @Roles(UserRole.ADMIN)
  async deleteEvent(@Param('eventCode') eventCode: string) {
    return this.eventService.removeEvent(eventCode);
  }

  @ApiOperation({ summary: 'Upload event images' })
  @ApiResponse({
    status: 200,
    description: 'Event images uploaded successfully',
    schema: {
      properties: {
        imageUrls: {
          type: 'array',
          items: {
            type: 'string',
            example: 'https://example.com/image.jpg',
          },
        },
      },
    },
  })
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

  @ApiOperation({ summary: 'Get event images' })
  @ApiResponse({
    status: 200,
    description: 'Returns event images',
    schema: {
      properties: {
        imageUrls: {
          type: 'array',
          items: {
            type: 'string',
            example: 'https://example.com/image.jpg',
          },
        },
      },
    },
  })
  @Get(':eventCode/images')
  @Roles(UserRole.ADMIN)
  async getEventImages(@Param('eventCode') eventCode: string) {
    return await this.eventService.getEventImages(eventCode);
  }
}
