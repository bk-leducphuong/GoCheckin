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
  Param,
} from '@nestjs/common';
import { PocService } from './poc.service';
import { CreatePocDto } from './dto/create-poc.dto';
import { UpdatePocDto } from './dto/update-poc.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/account/entities/account.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators/user.decorator';
import { JwtPayload } from 'src/common/interfaces/jwt-payload.interface';
import { PointOfCheckin } from './entities/poc.entity';
import { ValidatePocDto } from './dto/validate-poc.dto';
import { PocLocationsDto } from './dto/poc-locations.dto';
import { RegisterPocUserDto } from './dto/register-poc-user.dto';

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
  @Roles(UserRole.ADMIN)
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
    @CurrentUser() user: JwtPayload,
    @Query('eventCode') eventCode: string,
    @Body() createPocDto: CreatePocDto,
  ) {
    return this.pocService.create(eventCode, createPocDto);
  }

  @Get('poc')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get a point of check-in' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Point of check-in found successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Point of check-in not found',
  })
  async getPoc(
    @Query('pointCode') pointCode: string,
    @Query('eventCode') eventCode: string,
  ) {
    return this.pocService.getPocByPocCode(eventCode, pointCode);
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

  @Get('poc/manager')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get POC manager' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'POC manager found successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'POC manager not found',
  })
  async getPocManager(@Query('userId') userId: string) {
    return this.pocService.getPocManager(userId);
  }

  @Post('locations')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Save POC location' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'POC location saved successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'POC location not found',
  })
  async savePocLocation(@Body() pocLocations: PocLocationsDto) {
    return this.pocService.savePocLocation(pocLocations);
  }

  @Get('locations')
  @Roles(UserRole.ADMIN, UserRole.POC)
  @ApiOperation({ summary: 'Get POC locations' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'POC locations found successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'POC locations not found',
  })
  async getPocLocations(@Query('eventCode') eventCode: string) {
    return this.pocService.getPocLocations(eventCode);
  }

  @Get('user/:userId')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get POCs by user ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'POCs found successfully',
  })
  async getPocsByUserId(@Param('userId') userId: string) {
    return this.pocService.getPocsByUserId(userId);
  }

  @Post('register')
  @Roles(UserRole.ADMIN, UserRole.POC)
  @ApiOperation({ summary: 'Register a new POC user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'POC user registered successfully',
  })
  async registerPocUser(
    @CurrentUser() user: JwtPayload,
    @Body() registerPocUserDto: RegisterPocUserDto,
  ) {
    return this.pocService.registerPocUser(user, registerPocUserDto);
  }
}
