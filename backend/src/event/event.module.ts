import { forwardRef, Module } from '@nestjs/common';
import { EventController } from './event.controller';
import { EventService } from './event.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from './entities/event.entity';
import { AccountTenant } from 'src/account/entities/account-tenant.entity';
import { FloorPlanModule } from 'src/floor-plan/floor-plan.module';
import { PocModule } from 'src/poc/poc.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Event, AccountTenant]),
    FloorPlanModule,
    forwardRef(() => PocModule),
  ],
  controllers: [EventController],
  providers: [EventService],
  exports: [EventService],
})
export class EventModule {}
