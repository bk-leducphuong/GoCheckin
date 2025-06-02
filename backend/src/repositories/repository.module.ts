import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Import all entities
import { Account } from '../account/entities/account.entity';
import { AccountTenant } from '../account/entities/account-tenant.entity';
import { Event } from '../event/entities/event.entity';
import { Tenant } from '../tenant/entities/tenant.entity';
import { Guest } from '../guest/entities/guest.entity';
import { FloorPlan } from '../floor-plan/entities/floor-plan.entity';
import { GuestCheckin } from '../guest/entities/guest-checkin.entity';
import { Otp } from '../auth/entities/otp.entity';
import { Poc } from '../poc/entities/poc.entity';
import { PocInvite } from '../poc/entities/poc-invite.entity';
import { PocLocation } from '../poc/entities/poc-location.entity';
import { Token } from '../auth/entities/token.entity';
import { ResetToken } from '../auth/entities/reset-token.entity';
import { EventCheckinAnalytics } from '../analysis/entities/event-checkin-analytics.entity';
import { PointCheckinAnalytics } from '../analysis/entities/point-checkin-analytics.entity';

// Import all repositories
import { AccountRepository } from './account.repository';
import { AccountTenantRepository } from './account-tenant.repository';
import { EventRepository } from './event.repository';
import { TenantRepository } from './tenant.repository';
import { GuestRepository } from './guest.repository';
import { FloorPlanRepository } from './floor-plan.repository';
import { GuestCheckinRepository } from './guest-checkin.repository';
import { OtpRepository } from './otp.repository';
import { PocRepository } from './poc.repository';
import { PocInviteRepository } from './poc-invite.repository';
import { PocLocationRepository } from './poc-location.repository';
import { TokenRepository } from './token.repository';
import { ResetTokenRepository } from './reset-token.repository';
import { EventCheckinAnalysisRepository } from './event-checkin-analysis.repository';
import { PointCheckinAnalysisRepository } from './point-checkin-analysis.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Account,
      AccountTenant,
      Event,
      Tenant,
      Guest,
      FloorPlan,
      GuestCheckin,
      Otp,
      Poc,
      PocInvite,
      PocLocation,
      Token,
      ResetToken,
      EventCheckinAnalytics,
      PointCheckinAnalytics,
    ]),
  ],
  providers: [
    AccountRepository,
    AccountTenantRepository,
    EventRepository,
    TenantRepository,
    GuestRepository,
    FloorPlanRepository,
    GuestCheckinRepository,
    OtpRepository,
    PocRepository,
    PocInviteRepository,
    PocLocationRepository,
    TokenRepository,
    ResetTokenRepository,
    EventCheckinAnalysisRepository,
    PointCheckinAnalysisRepository,
  ],
  exports: [
    AccountRepository,
    AccountTenantRepository,
    EventRepository,
    TenantRepository,
    GuestRepository,
    FloorPlanRepository,
    GuestCheckinRepository,
    OtpRepository,
    PocRepository,
    PocInviteRepository,
    PocLocationRepository,
    TokenRepository,
    ResetTokenRepository,
    EventCheckinAnalysisRepository,
    PointCheckinAnalysisRepository,
  ],
})
export class RepositoryModule {}
