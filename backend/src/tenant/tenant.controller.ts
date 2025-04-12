import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('tenants')
@Controller('tenants')
export class TenantController {}
