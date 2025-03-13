import { Controller, Get, Put, Body, UseGuards, Delete } from '@nestjs/common';
import { AccountService } from './account.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/user.decorator';
import { JwtPayload } from '../common/interfaces/jwt-payload.interface';
import { UpdateAccountDto } from './dto/update-account.dto';

@Controller('account')
@UseGuards(JwtAuthGuard) // Protect all routes in this controller
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Get()
  async getAccount(@CurrentUser() user: JwtPayload) {
    return this.accountService.getAccount(user.userId);
  }

  // delete account
  @Delete()
  async deleteAccount(@CurrentUser() user: JwtPayload) {
    return this.accountService.deleteAccount(user.userId);
  }

  @Put()
  async updateAccount(
    @CurrentUser() user: JwtPayload,
    @Body() updateAccountDto: UpdateAccountDto,
  ) {
    return this.accountService.updateAccount(user.userId, updateAccountDto);
  }
}
