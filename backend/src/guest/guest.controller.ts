import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  Query,
  ParseFilePipeBuilder,
} from '@nestjs/common';
import { GuestService } from './guest.service';
import { CheckinDto } from './dto/checkin.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../account/entities/account.entity';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Guest } from './entities/guest.entity';
import { GuestCheckin } from './entities/guest-checkin.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { GuestResponse } from './dto/get-guests-response.dto';

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
  uploadImage(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addMaxSizeValidator({ maxSize: 5 * 1024 * 1024 })
        .addFileTypeValidator({ fileType: 'image/*' })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    image: Express.Multer.File,
  ) {
    return this.guestService.uploadImage(image);
  }

  @Get('poc')
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
  ): Promise<GuestResponse[]> {
    return this.guestService.getAllGuestsOfPoc(eventCode, pointCode);
  }

  @Get('event')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get all guests for a specific event',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns all guests for the event',
    type: [Guest],
  })
  async getAllGuestsOfEvent(@Query('eventCode') eventCode: string) {
    return this.guestService.getAllGuestsOfEvent(eventCode);
  }
}
