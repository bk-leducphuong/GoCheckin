import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from './entities/tenant.entity';
import { CreateTenantDto } from './dto/create-tenant.dto';

@Injectable()
export class TenantService {
  constructor(
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
  ) {}

  async createTenant(createTenantDto: CreateTenantDto): Promise<Tenant> {
    const isTenantCodeExist = await this.findByCode(createTenantDto.tenantCode);
    if (isTenantCodeExist) {
      throw new ConflictException(
        `Tenant with code ${createTenantDto.tenantCode} already exists`,
      );
    }

    const isTenantNameExist = await this.findByName(createTenantDto.tenantName);
    if (isTenantNameExist) {
      throw new ConflictException(
        `Tenant with name ${createTenantDto.tenantName} already exists`,
      );
    }

    const newTenant = this.tenantRepository.create(createTenantDto);
    return this.tenantRepository.save(newTenant);
  }

  async findByCode(code: string): Promise<Tenant> {
    const tenant = await this.tenantRepository.findOne({
      where: { tenantCode: code },
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant with code ${code} not found`);
    }

    return tenant;
  }

  async findByName(name: string): Promise<Tenant> {
    const tenant = await this.tenantRepository.findOne({
      where: { tenantName: name },
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant with name ${name} not found`);
    }

    return tenant;
  }
}
