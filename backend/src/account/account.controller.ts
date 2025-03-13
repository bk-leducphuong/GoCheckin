import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AccountService } from './account.service';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { AccountDto } from './dto/account.dto';
// import { UpdateAccountDto } from './dto/update-account.dto';

@Controller('accounts')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  getAccount(@Param('id') userId: string): Promise<AccountDto> {
    return this.accountService.getAccount(userId);
  }

  // @Put()
  // updateAccount(
  //   @User('sub') userId: string,
  //   @Body() updateDto: UpdateAccountDto,
  // ): Promise<AccountDto> {
  //   return this.accountService.updateAccount(userId, updateDto);
  // }
}
