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
import { PocService } from './poc.service';
import { CreatePocDto } from './dto/create-poc.dto';
import { UpdatePocDto } from './dto/update-poc.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/account/entities/account.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators/user.decorator';
import { JwtPayload } from 'src/common/interfaces/jwt-payload.interface';
import { PointOfCheckin } from './entities/poc.entity';
// import { JwtPayload } from 'src/common/interfaces/jwt-payload.interface';

@ApiTags('points-of-checkin')
@Controller('pocs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PocController {
  constructor(private readonly pocService: PocService) {}

  @Get(':eventCode')
  @Roles(UserRole.ADMIN, UserRole.TENANT)
  @ApiOperation({ summary: 'Get all points of check-in for an event' })
  @ApiParam({ name: 'eventCode', description: 'Event code' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns all points of check-in for the event',
  })
  async getAllPocs(@Param('eventCode') eventCode: string) {
    return this.pocService.getAllPocs(eventCode);
  }

  @Post(':eventCode')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new point of check-in for an event' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Point of check-in created successfully',
  })
  async createPoc(
    @Param('eventCode') eventCode: string,
    @Body() createPocDto: CreatePocDto,
  ) {
    return this.pocService.create(eventCode, createPocDto);
  }

  @Get(':pocId')
  @Roles(UserRole.ADMIN, UserRole.TENANT)
  @ApiOperation({ summary: 'Get details of a specific point of check-in' })
  @ApiParam({ name: 'pocId', description: 'Point of check-in ID or code' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns the point of check-in details',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Point of check-in not found',
  })
  async getPocDetails(@Param('pocId') pocId: string) {
    return this.pocService.findOne(pocId);
  }

  @Put(':pocId')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update a point of check-in' })
  @ApiParam({ name: 'pocId', description: 'Point of check-in ID or code' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Point of check-in updated successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Point of check-in not found',
  })
  async updatePoc(
    @Param('pocId') pocId: string,
    @Body() updatePocDto: UpdatePocDto,
  ) {
    return this.pocService.update(pocId, updatePocDto);
  }

  @Delete(':pocId')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a point of check-in (soft delete)' })
  @ApiParam({ name: 'pocId', description: 'Point of check-in ID or code' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Point of check-in deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Point of check-in not found',
  })
  async deletePoc(@Param('pocId') pocId: string) {
    return this.pocService.remove(pocId);
  }

  @Post('validate-poc')
  @Roles(UserRole.POC)
  @ApiOperation({ summary: 'Validate poc account' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Point of check-in validated successfully',
  })
  async validatePoc(
    @CurrentUser() user: JwtPayload,
    @Body() validatePocDto: any,
  ): Promise<PointOfCheckin> {
    return this.pocService.validatePoc(user, validatePocDto);
  }
}
