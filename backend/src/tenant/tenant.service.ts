import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Tenant } from './entities/tenant.entity';
import { CreateTenantDto, UpdateTenantDto } from './dto';
import { TenantRepository, AccountTenantRepository } from 'src/repositories';

@Injectable()
export class TenantService {
  constructor(
    private readonly tenantRepository: TenantRepository,
    private readonly accountTenantRepository: AccountTenantRepository,
  ) {}

  async createTenant(createTenantDto: CreateTenantDto): Promise<Tenant> {
    try {
      const isTenantCodeExist = await this.tenantRepository.findOne({
        tenantCode: createTenantDto.tenantCode,
      });
      if (isTenantCodeExist) {
        throw new ConflictException(
          `Tenant with code ${createTenantDto.tenantCode} already exists`,
        );
      }

      const isTenantNameExist = await this.tenantRepository.findOne({
        tenantName: createTenantDto.tenantName,
      });
      if (isTenantNameExist) {
        throw new ConflictException(
          `Tenant with name ${createTenantDto.tenantName} already exists`,
        );
      }

      const newTenant = await this.tenantRepository.create(createTenantDto);
      return await this.tenantRepository.save(newTenant);
    } catch (error) {
      console.error('Error creating tenant:', error);
      throw error;
    }
  }

  async getTenantInformationByUserId(userId: string): Promise<Tenant> {
    const accountTenants = await this.accountTenantRepository.findOne({
      userId: userId,
    });

    if (!accountTenants) {
      throw new NotFoundException('No tenant found for user');
    }

    const tenant = await this.tenantRepository.findOne({
      tenantId: accountTenants.tenantId,
    });

    if (!tenant) {
      throw new NotFoundException('No tenant found for user');
    }

    return tenant;
  }

  async updateTenantInformation(
    userId: string,
    updateTenantDto: UpdateTenantDto,
  ): Promise<Tenant> {
    const accountTenants = await this.accountTenantRepository.findOne({
      userId: userId,
    });
    if (!accountTenants) {
      throw new NotFoundException('No tenant found for user');
    }

    const tenant = await this.tenantRepository.findOne({
      tenantId: accountTenants.tenantId,
    });

    if (!tenant) {
      throw new NotFoundException('No tenant found for user');
    }

    const updatedTenant = this.tenantRepository.merge(tenant, updateTenantDto);
    return this.tenantRepository.save(updatedTenant);
  }
}
