import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PocController } from './poc.controller';
import { PocService } from './poc.service';
import { PointOfCheckin } from './entities/poc.entity';
import { EventModule } from 'src/event/event.module';
@Module({
  imports: [TypeOrmModule.forFeature([PointOfCheckin]), EventModule],
  controllers: [PocController],
  providers: [PocService],
  exports: [PocService],
})
export class PocModule {}
