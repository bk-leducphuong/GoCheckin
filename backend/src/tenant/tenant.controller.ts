import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TenantService } from './tenant.service';
import { JwtPayload } from 'src/common/interfaces/jwt-payload.interface';
import { CurrentUser } from 'src/common/decorators/user.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/account/entities/account.entity';

@ApiTags('tenant')
@Controller('tenant')
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.POC)
  getTenantInformation(@CurrentUser() user: JwtPayload) {
    return this.tenantService.getTenantInformation(user.userId);
  }
}
