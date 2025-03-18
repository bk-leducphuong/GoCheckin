import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { TenantService } from './tenant.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { CreateTenantMemberDto } from './dto/create-tenant-member.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/account/entities/account.entity';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators/user.decorator';
import { JwtPayload } from 'src/common/interfaces/jwt-payload.interface';

@ApiTags('tenants')
@Controller('tenants')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all tenants' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Returns all tenants' })
  findAll() {
    return this.tenantService.findAll();
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new tenant' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Tenant created successfully',
  })
  create(@Body() createTenantDto: CreateTenantDto) {
    return this.tenantService.create(createTenantDto);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get tenant by ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Returns tenant by ID' })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Tenant not found',
  })
  findOne(@Param('id') id: string) {
    return this.tenantService.findOne(id);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update tenant by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Tenant updated successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Tenant not found',
  })
  update(@Param('id') id: string, @Body() updateTenantDto: UpdateTenantDto) {
    return this.tenantService.update(id, updateTenantDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove tenant by ID (soft delete)' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Tenant removed successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Tenant not found',
  })
  remove(@Param('id') id: string) {
    return this.tenantService.remove(id);
  }

  @Get('code/:code')
  @Roles(UserRole.ADMIN, UserRole.TENANT)
  @ApiOperation({ summary: 'Get tenant by code' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Returns tenant by code' })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Tenant not found',
  })
  findByCode(@Param('code') code: string) {
    return this.tenantService.findByCode(code);
  }

  @Get('get-tenant-code')
  @Roles(UserRole.ADMIN, UserRole.TENANT)
  @ApiOperation({ summary: 'Get tenant code from user JWT token' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Returns tenant code' })
  getTenantCode(@CurrentUser() user: JwtPayload) {
    const userId = user.userId;
    // Implementation depends on how user-tenant relationships are stored
    // This is a placeholder - actual implementation would retrieve the tenant code
    // associated with the user from the database
    return { tenantCode: 'retrieved-from-user-id' };
  }

  @Get('get-all-tenant-members')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all tenant member accounts' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns all tenant members',
  })
  getAllTenantMembers(@Body() { tenantCode }: { tenantCode: string }) {
    // Implementation depends on AccountService to retrieve accounts by tenant code
    return {
      message: `Retrieved all tenant members for tenant code: ${tenantCode}`,
    };
  }

  @Post('create-new-tenant-member')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new tenant member account' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Tenant member created successfully',
  })
  createNewTenantMember(@Body() createTenantMemberDto: CreateTenantMemberDto) {
    // Implementation depends on AccountService to create a new account
    return { message: 'Tenant member created successfully' };
  }

  @Put('update-tenant-details')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update tenant details' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Tenant details updated successfully',
  })
  updateTenantDetails(
    @Body()
    { tenantCode, ...updateData }: UpdateTenantDto & { tenantCode: string },
  ) {
    return this.tenantService.updateByCode(tenantCode, updateData);
  }

  @Get('get-tenant-details')
  @Roles(UserRole.ADMIN, UserRole.TENANT)
  @ApiOperation({ summary: 'Get tenant details' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Returns tenant details' })
  getTenantDetails(@Body() { tenantCode }: { tenantCode: string }) {
    return this.tenantService.findByCode(tenantCode);
  }

  @Delete('delete-tenant-member-account')
  @Roles(UserRole.ADMIN, UserRole.TENANT)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete tenant member account (soft delete)' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Tenant member deleted successfully',
  })
  deleteTenantMemberAccount(@Body() { userId }: { userId: string }) {
    // Implementation depends on AccountService to delete an account
    return { message: `Tenant member with ID: ${userId} deleted successfully` };
  }

  @Delete('delete-tenant-admin-account')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete tenant admin account (soft delete)' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Tenant admin deleted successfully',
  })
  deleteTenantAdminAccount(@Body() { userId }: { userId: string }) {
    // Implementation depends on AccountService to delete an account
    return { message: `Tenant admin with ID: ${userId} deleted successfully` };
  }
}
