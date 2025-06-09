import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Import all entities
import { Account, AccountTenant } from '../account/entities';
import { Event } from '../event/entities';
import { Tenant } from '../tenant/entities';
import { Guest, GuestCheckin } from '../guest/entities';
import { FloorPlan } from '../floor-plan/entities';
import { Poc, PocInvite, PocLocation } from '../poc/entities';
import { ResetToken, Token, Otp } from '../auth/entities';
import {
  EventCheckinAnalytics,
  PointCheckinAnalytics,
} from '../analysis/entities';

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
