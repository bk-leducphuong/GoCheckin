import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from './entities/tenant.entity';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';

@Injectable()
export class TenantService {
  constructor(
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
  ) {}

  async create(createTenantDto: CreateTenantDto): Promise<Tenant> {
    // Check if tenant with the same code already exists
    const existingTenant = await this.tenantRepository.findOne({
      where: { tenantCode: createTenantDto.tenantCode },
    });

    if (existingTenant) {
      throw new ConflictException(
        `Tenant with code ${createTenantDto.tenantCode} already exists`,
      );
    }

    const newTenant = this.tenantRepository.create(createTenantDto);
    return this.tenantRepository.save(newTenant);
  }

  async findAll(): Promise<Tenant[]> {
    return this.tenantRepository.find();
  }

  async findOne(id: string): Promise<Tenant> {
    const tenant = await this.tenantRepository.findOne({
      where: { tenantId: id },
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant with ID ${id} not found`);
    }

    return tenant;
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

  async update(id: string, updateTenantDto: UpdateTenantDto): Promise<Tenant> {
    const tenant = await this.findOne(id);

    // Update tenant properties
    Object.assign(tenant, updateTenantDto);

    return this.tenantRepository.save(tenant);
  }

  async updateByCode(
    code: string,
    updateTenantDto: UpdateTenantDto,
  ): Promise<Tenant> {
    const tenant = await this.findByCode(code);

    // Update tenant properties
    Object.assign(tenant, updateTenantDto);

    return this.tenantRepository.save(tenant);
  }

  async remove(id: string): Promise<void> {
    const tenant = await this.findOne(id);

    // Soft delete - just set enabled to false
    tenant.enabled = false;
    await this.tenantRepository.save(tenant);
  }

  async removeByCode(code: string): Promise<void> {
    const tenant = await this.findByCode(code);

    // Soft delete - just set enabled to false
    tenant.enabled = false;
    await this.tenantRepository.save(tenant);
  }
}
