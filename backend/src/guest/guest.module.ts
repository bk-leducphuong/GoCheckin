import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GuestController } from './guest.controller';
import { GuestService } from './guest.service';
import { Guest } from './entities/guest.entity';
import { GuestCheckin } from './entities/guest-checkin.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Guest, GuestCheckin])],
  controllers: [GuestController],
  providers: [GuestService],
  exports: [GuestService],
})
export class GuestModule {}
