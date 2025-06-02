import { Module } from '@nestjs/common';
import { EventController } from './event.controller';
import { EventService } from './event.service';
import { FloorPlanModule } from 'src/floor-plan/floor-plan.module';
import { PocModule } from 'src/poc/poc.module';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { S3Service } from 'src/common/services/s3.service';
import { RepositoryModule } from 'src/repositories/repository.module';

@Module({
  imports: [
    RepositoryModule,
    FloorPlanModule,
    PocModule,
    MulterModule.register({
      storage: memoryStorage(),
      fileFilter: (req, file, callback) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
          return callback(new Error('Only image files are allowed!'), false);
        }
        callback(null, true);
      },
    }),
  ],
  controllers: [EventController],
  providers: [EventService, S3Service],
  exports: [EventService],
})
export class EventModule {}
