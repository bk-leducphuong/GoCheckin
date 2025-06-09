import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  UseGuards,
  HttpStatus,
  Query,
  Param,
} from '@nestjs/common';
import { PocService } from './poc.service';
import {
  CreatePocDto,
  UpdatePocDto,
  ValidatePocDto,
  RegisterPocUserDto,
  PocLocationsDto,
  InvitePocUserDto,
  PocManagerDto,
  PocLocationDto,
} from './dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/account/entities/account.entity';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators/user.decorator';
import { JwtPayload } from 'src/common/interfaces/jwt-payload.interface';
import { Poc } from './entities/poc.entity';
import { PocInvite } from './entities/poc-invite.entity';

@ApiTags('pocs')
@Controller('pocs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PocController {
  constructor(private readonly pocService: PocService) {}

  @Post('validate-poc')
  @Roles(UserRole.POC)
  @ApiOperation({ summary: 'Validate poc account' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Validate poc account successfully',
    type: Poc,
  })
  async validatePoc(
    @CurrentUser() user: JwtPayload,
    @Body() validatePocDto: ValidatePocDto,
  ) {
    return this.pocService.validatePoc(user, validatePocDto);
  }

  @Get('event')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all check-in points for an event' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Get all check-in points for the event successfully',
    type: [Poc],
  })
  async getAllPocs(@Query('eventCode') eventCode: string) {
    return this.pocService.getAllPocs(eventCode);
  }

  @Post('event')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new check-in point for an event' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Create check-in point successfully',
    type: Poc,
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
  @ApiOperation({ summary: 'Get a check-in point' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Get check-in point successfully',
    type: Poc,
  })
  async getPoc(
    @Query('pointCode') pointCode: string,
    @Query('eventCode') eventCode: string,
  ) {
    return this.pocService.getPocByPocCode(eventCode, pointCode);
  }

  @Put('poc')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update a check-in point' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Update check-in point successfully',
    type: Poc,
  })
  async updatePoc(
    @Query('pocId') pocId: string,
    @Body() updatePocDto: UpdatePocDto,
  ) {
    return this.pocService.update(pocId, updatePocDto);
  }

  @Delete('poc')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a check-in point' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Delete check-in point successfully',
  })
  async deletePoc(@Query('pocId') pocId: string) {
    return this.pocService.remove(pocId);
  }

  @Get('poc/manager')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get POC manager' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Get poc manager successfully',
    type: PocManagerDto,
  })
  async getPocManager(@Query('userId') userId: string) {
    return this.pocService.getPocManager(userId);
  }

  @Post('locations')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Save POC location' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Save poc location successfully',
  })
  async savePocLocation(@Body() pocLocations: PocLocationsDto) {
    return this.pocService.savePocLocation(pocLocations);
  }

  @Get('locations')
  @Roles(UserRole.ADMIN, UserRole.POC)
  @ApiOperation({ summary: 'Get POC locations' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Get poc locations successfully',
    type: [PocLocationDto],
  })
  async getPocLocations(@Query('eventCode') eventCode: string) {
    return this.pocService.getPocLocations(eventCode);
  }

  @Get('user/:userId')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get POCs by user ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Get pocs by user id successfully',
    type: [Poc],
  })
  async getPocsByUserId(@Param('userId') userId: string) {
    return this.pocService.getPocsByUserId(userId);
  }

  @Post('register')
  @Roles(UserRole.ADMIN, UserRole.POC)
  @ApiOperation({ summary: 'Register a new POC user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Register poc user successfully',
  })
  async registerPocUser(
    @CurrentUser() user: JwtPayload,
    @Body() registerPocUserDto: RegisterPocUserDto,
  ) {
    return this.pocService.registerPocUser(user, registerPocUserDto);
  }

  @Post('invite')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Invite a POC user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Invite poc user successfully',
  })
  async invitePocUser(@Body() invitePocUserDto: InvitePocUserDto) {
    return this.pocService.invitePocUser(invitePocUserDto);
  }

  @Post('invite/accept')
  @Roles(UserRole.POC)
  @ApiOperation({ summary: 'Accept a POC invite' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Accept poc invite successfully',
  })
  async acceptPocInvite(
    @CurrentUser() user: JwtPayload,
    @Query('inviteCode') inviteCode: string,
  ) {
    return this.pocService.acceptPocInvite(user, inviteCode);
  }

  @Get('invite')
  @Roles(UserRole.POC)
  @ApiOperation({ summary: 'Get POC invite' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Get poc invite successfully',
    type: PocInvite,
  })
  async getPocInvite(
    @Query('eventCode') eventCode: string,
    @Query('pointCode') pointCode: string,
  ) {
    return this.pocService.getPocInvite(eventCode, pointCode);
  }
}
