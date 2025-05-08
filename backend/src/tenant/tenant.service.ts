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
    try {
      const isTenantCodeExist = await this.findByCode(
        createTenantDto.tenantCode,
      );
      if (isTenantCodeExist) {
        throw new ConflictException(
          `Tenant with code ${createTenantDto.tenantCode} already exists`,
        );
      }

      const isTenantNameExist = await this.findByName(
        createTenantDto.tenantName,
      );
      if (isTenantNameExist) {
        throw new ConflictException(
          `Tenant with name ${createTenantDto.tenantName} already exists`,
        );
      }

      const newTenant = this.tenantRepository.create(createTenantDto);
      return this.tenantRepository.save(newTenant);
    } catch (error) {
      console.error('Error creating tenant:', error);
      throw error;
    }
  }

  async findByCode(code: string): Promise<Tenant> {
    try {
      const tenant = await this.tenantRepository.findOne({
        where: { tenantCode: code },
      });

      if (!tenant) {
        throw new NotFoundException(`Tenant with code ${code} not found`);
      }

      return tenant;
    } catch (error) {
      console.error('Error finding tenant by code:', error);
      throw error;
    }
  }

  async findByName(name: string): Promise<Tenant> {
    try {
      const tenant = await this.tenantRepository.findOne({
        where: { tenantName: name },
      });

      if (!tenant) {
        throw new NotFoundException(`Tenant with name ${name} not found`);
      }

      return tenant;
    } catch (error) {
      console.error('Error finding tenant by name:', error);
      throw error;
    }
  }
}
