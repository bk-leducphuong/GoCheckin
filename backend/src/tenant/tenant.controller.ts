import {
  Controller,
  Get,
  // Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { TenantService } from './tenant.service';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/account/entities/account.entity';

@Controller('tenants')
@UseGuards(JwtAuthGuard)
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Get('all')
  @Roles(UserRole.ADMIN)
  async getAllTenants() {
    return this.tenantService.getAllTenants();
  }

  @Get()
  async getTenant() {
    return this.tenantService.getTenant();
  }

  // @Post('')
  // async createTenant(@Body() tenantData: any) {
  //   return this.tenantService.createTenant(tenantData);
  // }

  @Put(':tenantId')
  @Roles(UserRole.TENANT)
  async updateTenant(@Body() tenantData: UpdateTenantDto) {
    return this.tenantService.updateTenant(tenantData);
  }

  @Delete(':tenantId')
  @Roles(UserRole.ADMIN, UserRole.TENANT)
  async deleteTenant(@Param('tenantId') tenantId: string) {
    return this.tenantService.deleteTenant(tenantId);
  }
}
