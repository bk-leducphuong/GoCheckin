import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PocController } from './poc.controller';
import { PocService } from './poc.service';
import { PointOfCheckin } from './entities/poc.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PointOfCheckin])],
  controllers: [PocController],
  providers: [PocService],
  exports: [PocService],
})
export class PocModule {}
