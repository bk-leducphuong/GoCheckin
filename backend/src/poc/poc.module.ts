import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PocController } from './poc.controller';
import { PocService } from './poc.service';
import { PointOfCheckin } from './entities/poc.entity';
import { EventModule } from 'src/event/event.module';
import { AccountModule } from 'src/account/account.module';
import { PocLocation } from './entities/poc-location.entity';
import { FloorPlanModule } from 'src/floor-plan/floor-plan.module';
import { MailModule } from 'src/mail/mail.module';
import { PocInvite } from './entities/poc-invite';
import { PocRepository } from '../repositories/poc.repository';
import { PocLocationRepository } from '../repositories/poc-location.repository';
import { PocInviteRepository } from '../repositories/poc-invite.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([PointOfCheckin, PocLocation, PocInvite]),
    forwardRef(() => EventModule),
    AccountModule,
    forwardRef(() => FloorPlanModule),
    forwardRef(() => MailModule),
  ],
  controllers: [PocController],
  providers: [
    PocService,
    PocRepository,
    PocLocationRepository,
    PocInviteRepository,
  ],
  exports: [PocService],
})
export class PocModule {}
