import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  HttpStatus,
  HttpCode,
  UseInterceptors,
  UploadedFile,
  Query,
} from '@nestjs/common';
import { GuestService } from './guest.service';
import { UpdateGuestDto } from './dto/update-guest.dto';
import { CheckinDto } from './dto/checkin.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../account/entities/account.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { Guest } from './entities/guest.entity';
import { GuestCheckin } from './entities/guest-checkin.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  GetGuestsResponseDto,
  GuestResponse,
} from './dto/get-guests-response.dto';

@ApiTags('guests')
@Controller('guests')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GuestController {
  constructor(private readonly guestService: GuestService) {}

  @Post('checkin')
  @Roles(UserRole.POC)
  @ApiOperation({ summary: 'Check in a guest at a point of check-in' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Guest checked in successfully',
    type: GuestCheckin,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Guest not found',
  })
  async checkinGuest(@Body() checkinDto: CheckinDto): Promise<GuestResponse> {
    return this.guestService.checkin(checkinDto);
  }

  @Post('checkin/upload-image')
  @Roles(UserRole.POC)
  @ApiOperation({
    summary: 'Upload an im  age for a guest check-in',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Image uploaded successfully',
    type: String,
  })
  @UseInterceptors(FileInterceptor('image'))
  uploadImage(@UploadedFile() image: Express.Multer.File): string {
    return this.guestService.uploadImage(image);
  }

  @Get('checkins/:guestId')
  @Roles(UserRole.ADMIN, UserRole.POC)
  @ApiOperation({ summary: 'Get all check-ins for a specific guest' })
  @ApiParam({ name: 'eventCode', description: 'Event code' })
  @ApiParam({ name: 'pointCode', description: 'Point of check-in code' })
  @ApiParam({ name: 'guestId', description: 'Guest ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns all check-ins for the guest',
    type: [GuestCheckin],
  })
  async getGuestCheckins(
    @Param('guestId') guestId: string,
  ): Promise<GuestCheckin[]> {
    return this.guestService.getGuestCheckins(guestId);
  }

  @Get('poc-checkins')
  @Roles(UserRole.ADMIN, UserRole.POC)
  @ApiOperation({
    summary: 'Get all check-ins at a specific point of check-in',
  })
  @ApiParam({ name: 'eventCode', description: 'Event code' })
  @ApiParam({ name: 'pointCode', description: 'Point of check-in code' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns all check-ins at the point of check-in',
    type: [GuestCheckin],
  })
  async getPocCheckins(
    @Param('eventCode') eventCode: string,
    @Param('pocId') pocId: string,
  ): Promise<GuestCheckin[]> {
    return this.guestService.getPocCheckins(pocId, eventCode);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.POC)
  @ApiOperation({
    summary: 'Get all guests for a specific event and point of check-in',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns all guests for the event and point of check-in',
    type: [Guest],
  })
  async getAllGuestsOfPoc(
    @Query('eventCode') eventCode: string,
    @Query('pointCode') pointCode: string,
  ): Promise<GetGuestsResponseDto> {
    return this.guestService.getAllGuestsOfPoc(eventCode, pointCode);
  }

  @Get('all')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary:
      'Get all guests for a specific event across all points of check-in',
  })
  @ApiParam({ name: 'eventCode', description: 'Event code' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns all guests for the event',
    type: [Guest],
  })
  async getAllGuestsByEvent(): Promise<Guest[]> {
    return this.guestService.findAllByEvent();
  }

  @Get(':guestCode')
  @Roles(UserRole.ADMIN, UserRole.POC)
  @ApiOperation({ summary: 'Get guest details by guest code' })
  @ApiParam({ name: 'eventCode', description: 'Event code' })
  @ApiParam({ name: 'pointCode', description: 'Point of check-in code' })
  @ApiParam({ name: 'guestCode', description: 'Guest code' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns the guest details',
    type: Guest,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Guest not found',
  })
  async getGuestDetails(@Param('guestCode') guestCode: string): Promise<Guest> {
    return this.guestService.findByCodeAndEvent(guestCode);
  }

  @Get('id/:guestId')
  @Roles(UserRole.ADMIN, UserRole.POC)
  @ApiOperation({ summary: 'Get guest details by guest ID' })
  @ApiParam({ name: 'eventCode', description: 'Event code' })
  @ApiParam({ name: 'pointCode', description: 'Point of check-in code' })
  @ApiParam({ name: 'guestId', description: 'Guest ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns the guest details',
    type: Guest,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Guest not found',
  })
  async getGuestById(@Param('guestId') guestId: string): Promise<Guest> {
    return this.guestService.findOne(guestId);
  }

  @Put(':guestId')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update guest details' })
  @ApiParam({ name: 'eventCode', description: 'Event code' })
  @ApiParam({ name: 'pointCode', description: 'Point of check-in code' })
  @ApiParam({ name: 'guestId', description: 'Guest ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Guest updated successfully',
    type: Guest,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Guest not found',
  })
  async updateGuest(
    @Param('guestId') guestId: string,
    @Body() updateGuestDto: UpdateGuestDto,
  ): Promise<Guest> {
    return this.guestService.update(guestId, updateGuestDto);
  }

  @Delete(':guestId')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a guest (soft delete)' })
  @ApiParam({ name: 'eventCode', description: 'Event code' })
  @ApiParam({ name: 'pointCode', description: 'Point of check-in code' })
  @ApiParam({ name: 'guestId', description: 'Guest ID' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Guest deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Guest not found',
  })
  async deleteGuest(@Param('guestId') guestId: string): Promise<void> {
    return this.guestService.remove(guestId);
  }

  // @Delete()
  // @Roles(UserRole.ADMIN)
  // @HttpCode(HttpStatus.NO_CONTENT)
  // @ApiOperation({
  //   summary:
  //     'Delete all guests for a specific event and point of check-in (soft delete)',
  // })
  // @ApiParam({ name: 'eventCode', description: 'Event code' })
  // @ApiParam({ name: 'pointCode', description: 'Point of check-in code' })
  // @ApiResponse({
  //   status: HttpStatus.NO_CONTENT,
  //   description:
  //     'All guests for the event and point of check-in deleted successfully',
  // })
  // async deleteAllGuestsByEventAndPoint(): Promise<void> {
  //   return this.guestService.removeAllByEventAndPoint();
  // }

  // @Delete('all')
  // @Roles(UserRole.ADMIN)
  // @HttpCode(HttpStatus.NO_CONTENT)
  // @ApiOperation({
  //   summary:
  //     'Delete all guests for a specific event across all points of check-in (soft delete)',
  // })
  // @ApiParam({ name: 'eventCode', description: 'Event code' })
  // @ApiResponse({
  //   status: HttpStatus.NO_CONTENT,
  //   description: 'All guests for the event deleted successfully',
  // })
  // async deleteAllGuestsByEvent(
  //   @Param('eventCode') eventCode: string,
  // ): Promise<void> {
  //   return this.guestService.removeAllByEvent(eventCode);
  // }
}
