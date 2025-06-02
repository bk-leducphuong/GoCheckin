import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Tenant } from '../tenant/entities/tenant.entity';

@Injectable()
export class TenantRepository {
  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
  ) {}

  async findOne(where: FindOptionsWhere<Tenant>): Promise<Tenant | null> {
    try {
      return await this.tenantRepository.findOne({ where });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async create(data: Partial<Tenant>): Promise<Tenant> {
    try {
      return await this.tenantRepository.save(data);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async save(tenant: Tenant): Promise<Tenant> {
    try {
      return await this.tenantRepository.save(tenant);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  merge(target: Tenant, source: Partial<Tenant>): Tenant {
    try {
      return this.tenantRepository.merge(target, source);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
