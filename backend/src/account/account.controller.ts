import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
  Delete,
  UnauthorizedException,
} from '@nestjs/common';
import { AccountService } from './account.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
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
  @Roles(UserRole.ADMIN, UserRole.TENANT)
  async getAccount(@CurrentUser() user: JwtPayload) {
    return this.accountService.getAccount(user.userId);
  }

  @Put()
  @Roles(UserRole.ADMIN, UserRole.TENANT)
  async updateAccount(
    @CurrentUser() user: JwtPayload,
    @Body() updateAccountDto: UpdateAccountDto,
  ) {
    // Only admins can update other accounts
    if (
      user.role !== UserRole.ADMIN &&
      user.userId !== updateAccountDto.userId
    ) {
      throw new UnauthorizedException('You can only update your own account');
    }
    return this.accountService.updateAccount(user.userId, updateAccountDto);
  }

  @Delete()
  @Roles(UserRole.ADMIN) // Only admins can delete accounts
  async deleteAccount(@CurrentUser() user: JwtPayload) {
    return this.accountService.deleteAccount(user.userId);
  }
}
