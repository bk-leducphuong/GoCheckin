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
} from '@nestjs/common';
import { GuestService } from './guest.service';
import { CreateGuestDto } from './dto/create-guest.dto';
import { UpdateGuestDto } from './dto/update-guest.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../account/entities/account.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { Guest } from './entities/guest.entity';

@ApiTags('guests')
@Controller('guests')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GuestController {
  constructor(private readonly guestService: GuestService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.POC)
  @ApiOperation({ summary: 'Create a new guest' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Guest created successfully',
    type: Guest,
  })
  async createGuest(@Body() createGuestDto: CreateGuestDto): Promise<Guest> {
    return this.guestService.create(createGuestDto);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all guests' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns all guests',
    type: [Guest],
  })
  async getAllGuests(): Promise<Guest[]> {
    return this.guestService.findAll();
  }

  @Get(':guestId')
  @Roles(UserRole.ADMIN, UserRole.POC)
  @ApiOperation({ summary: 'Get guest details by ID' })
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
  async getGuestDetails(@Param('guestId') guestId: string): Promise<Guest> {
    return this.guestService.findOne(guestId);
  }

  @Put(':guestId')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update guest details' })
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

  @Delete()
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete all guests (soft delete)' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'All guests deleted successfully',
  })
  async deleteAllGuests(): Promise<void> {
    return this.guestService.removeAll();
  }
}
