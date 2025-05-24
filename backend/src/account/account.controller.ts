import { Controller, Get, Put, Body, UseGuards, Delete } from '@nestjs/common';
import { AccountService } from './account.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/user.decorator';
import { JwtPayload } from '../common/interfaces/jwt-payload.interface';
import { UpdateAccountDto } from './dto/update-account.dto';
import { UserRole } from './entities/account.entity';

@Controller('account')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.POC)
  async getAccountInformation(@CurrentUser() user: JwtPayload) {
    return this.accountService.getAccountInformation(user.userId);
  }

  @Put()
  @Roles(UserRole.ADMIN, UserRole.POC)
  async updateAccountInformation(
    @CurrentUser() user: JwtPayload,
    @Body() updateAccountDto: UpdateAccountDto,
  ) {
    return this.accountService.updateAccount(user.userId, updateAccountDto);
  }

  @Delete()
  @Roles(UserRole.ADMIN, UserRole.POC)
  async deleteAccount(@CurrentUser() user: JwtPayload) {
    return this.accountService.deleteAccount(user.userId);
  }
}
