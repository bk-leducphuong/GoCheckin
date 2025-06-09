import { Controller, Get, Put, Body, UseGuards, Delete } from '@nestjs/common';
import { AccountService } from './account.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/user.decorator';
import { JwtPayload } from '../common/interfaces/jwt-payload.interface';
import { AccountDto, UpdateAccountDto } from './dto';
import { UserRole } from './entities/account.entity';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('account')
@Controller('account')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @ApiOperation({ summary: 'Get account information' })
  @ApiResponse({
    status: 200,
    description: 'Get account information successfully',
    type: AccountDto,
  })
  @Get()
  @Roles(UserRole.ADMIN, UserRole.POC)
  async getAccountInformation(@CurrentUser() user: JwtPayload) {
    return this.accountService.getAccountInformation(user.userId);
  }

  @ApiOperation({ summary: 'Update account information' })
  @ApiResponse({
    status: 200,
    description: 'Update account information successfully',
    type: AccountDto,
  })
  @Put()
  @Roles(UserRole.ADMIN, UserRole.POC)
  async updateAccountInformation(
    @CurrentUser() user: JwtPayload,
    @Body() updateAccountDto: UpdateAccountDto,
  ) {
    return this.accountService.updateAccount(user.userId, updateAccountDto);
  }

  @ApiOperation({ summary: 'Delete poc account' })
  @ApiResponse({
    status: 200,
    description: 'Delete poc account successfully',
  })
  @Delete('poc')
  @Roles(UserRole.POC)
  async deletePocAccount(@CurrentUser() user: JwtPayload) {
    return this.accountService.deletePocAccount(user.userId);
  }

  @ApiOperation({ summary: 'Delete admin account' })
  @ApiResponse({
    status: 200,
    description: 'Delete admin account successfully',
  })
  @Delete('admin')
  @Roles(UserRole.ADMIN)
  async deleteAdminAccount(@CurrentUser() user: JwtPayload) {
    return this.accountService.deleteAdminAccount(user.userId);
  }
}
