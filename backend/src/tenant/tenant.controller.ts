import { Body, Controller, Get, HttpStatus, Put } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TenantService } from './tenant.service';
import { JwtPayload } from 'src/common/interfaces/jwt-payload.interface';
import { CurrentUser } from 'src/common/decorators/user.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/account/entities/account.entity';
import { UpdateTenantDto } from './dto';
import { Tenant } from './entities/tenant.entity';

@ApiTags('tenant')
@Controller('tenant')
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @ApiOperation({ summary: 'Get tenant information by user id' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Get tenant information by user id successfully',
    type: Tenant,
  })
  @Get()
  @Roles(UserRole.ADMIN, UserRole.POC)
  getTenantInformationByUserId(@CurrentUser() user: JwtPayload) {
    return this.tenantService.getTenantInformationByUserId(user.userId);
  }

  @ApiOperation({ summary: 'Update tenant information' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Update tenant information successfully',
    type: Tenant,
  })
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
