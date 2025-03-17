import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from './entities/tenant.entity';
import { UpdateTenantDto } from './dto/update-tenant.dto';

@Injectable()
export class TenantService {
  constructor(
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
  ) {}

  async getAllTenants(): Promise<Tenant[]> {
    return this.tenantRepository.find();
  }

  async getTenant(tenantId: string): Promise<Tenant> {
    const tenant = await this.tenantRepository.findOne({
      where: { tenantId },
    });
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }
    return tenant;
  }

  async createTenant(tenantData: Partial<Tenant>): Promise<Tenant> {
    const tenant = this.tenantRepository.create(tenantData);
    return this.tenantRepository.save(tenant);
  }

  async updateTenant(
    tenantId: string,
    tenantData: UpdateTenantDto,
  ): Promise<Tenant> {
    await this.tenantRepository.update(tenantId, tenantData);
    const updatedTenant = await this.tenantRepository.findOne({
      where: { tenantId },
    });
    if (!updatedTenant) {
      throw new NotFoundException('Tenant not found');
    }
    return updatedTenant;
  }

  async deleteTenant(tenantId: string) {
    const tenant = await this.tenantRepository.findOne({
      where: { tenantId },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    await this.tenantRepository.delete(tenantId);
  }
}
