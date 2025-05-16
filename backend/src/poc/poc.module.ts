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

@Module({
  imports: [
    TypeOrmModule.forFeature([PointOfCheckin, PocLocation]),
    forwardRef(() => EventModule),
    AccountModule,
    forwardRef(() => FloorPlanModule),
    MailModule,
  ],
  controllers: [PocController],
  providers: [PocService],
  exports: [PocService],
})
export class PocModule {}
