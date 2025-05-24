import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from './entities/tenant.entity';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { AccountTenantService } from 'src/account/account-tenant.service';
import { UpdateTenantDto } from './dto/update-tenant.dto';

@Injectable()
export class TenantService {
  constructor(
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
    private accountTenantService: AccountTenantService,
  ) {}

  async createTenant(createTenantDto: CreateTenantDto): Promise<Tenant> {
    try {
      const isTenantCodeExist = await this.tenantRepository.findOne({
        where: { tenantCode: createTenantDto.tenantCode },
      });
      if (isTenantCodeExist) {
        throw new ConflictException(
          `Tenant with code ${createTenantDto.tenantCode} already exists`,
        );
      }

      const isTenantNameExist = await this.tenantRepository.findOne({
        where: { tenantName: createTenantDto.tenantName },
      });
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

  async getTenantInformation(userId: string): Promise<Tenant> {
    const accountTenants =
      await this.accountTenantService.findTenantsByUserId(userId);

    const tenant = await this.tenantRepository.findOne({
      where: { tenantCode: accountTenants.tenantCode },
    });

    if (!tenant) {
      throw new NotFoundException('No tenant found for user');
    }

    return tenant;
  }

  async updateTenantInformation(
    userId: string,
    updateTenantDto: UpdateTenantDto,
  ) {
    const accountTenants =
      await this.accountTenantService.findTenantsByUserId(userId);

    const tenant = await this.tenantRepository.findOne({
      where: { tenantCode: accountTenants.tenantCode },
    });

    if (!tenant) {
      throw new NotFoundException('No tenant found for user');
    }

    const updatedTenant = this.tenantRepository.merge(tenant, updateTenantDto);
    return this.tenantRepository.save(updatedTenant);
  }
}
