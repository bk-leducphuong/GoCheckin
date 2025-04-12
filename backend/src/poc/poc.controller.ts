import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  UseGuards,
  HttpStatus,
  HttpCode,
  Query,
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
import { ValidatePocDto } from './dto/validate-poc.dto';
// import { JwtPayload } from 'src/common/interfaces/jwt-payload.interface';

@ApiTags('points-of-checkin')
@Controller('pocs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PocController {
  constructor(private readonly pocService: PocService) {}

  @Post('validate-poc')
  @Roles(UserRole.POC)
  @ApiOperation({ summary: 'Validate poc account' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Point of check-in validated successfully',
  })
  async validatePoc(
    @CurrentUser() user: JwtPayload,
    @Body() validatePocDto: ValidatePocDto,
  ): Promise<PointOfCheckin> {
    return this.pocService.validatePoc(user, validatePocDto);
  }

  @Get('event')
  @Roles(UserRole.ADMIN, UserRole.TENANT)
  @ApiOperation({ summary: 'Get all points of check-in for an event' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns all points of check-in for the event',
  })
  async getAllPocs(@Query('eventCode') eventCode: string) {
    return this.pocService.getAllPocs(eventCode);
  }

  @Post('event')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new point of check-in for an event' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Point of check-in created successfully',
  })
  async createPoc(
    @Query('eventCode') eventCode: string,
    @Body() createPocDto: CreatePocDto,
  ) {
    return this.pocService.create(eventCode, createPocDto);
  }

  @Put('poc')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update a point of check-in' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Point of check-in updated successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Point of check-in not found',
  })
  async updatePoc(
    @Query('pocId') pocId: string,
    @Body() updatePocDto: UpdatePocDto,
  ) {
    return this.pocService.update(pocId, updatePocDto);
  }

  @Delete('poc')
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
  async deletePoc(@Query('pocId') pocId: string) {
    return this.pocService.remove(pocId);
  }
}
