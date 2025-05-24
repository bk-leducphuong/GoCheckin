import { Body, Controller, Get, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TenantService } from './tenant.service';
import { JwtPayload } from 'src/common/interfaces/jwt-payload.interface';
import { CurrentUser } from 'src/common/decorators/user.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/account/entities/account.entity';
import { UpdateTenantDto } from './dto/update-tenant.dto';

@ApiTags('tenant')
@Controller('tenant')
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.POC)
  getTenantInformation(@CurrentUser() user: JwtPayload) {
    return this.tenantService.getTenantInformation(user.userId);
  }

  @Put()
  @Roles(UserRole.ADMIN)
  updateTenantInformation(
    @CurrentUser() user: JwtPayload,
    @Body() updateTenantDto: UpdateTenantDto,
  ) {
    return this.tenantService.updateTenantInformation(
      user.userId,
      updateTenantDto,
    );
  }
}
