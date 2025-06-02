import { Module } from '@nestjs/common';
import { FloorPlanService } from './floor-plan.service';
import { FloorPlanController } from './floor-plan.controller';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { S3Service } from 'src/common/services/s3.service';
import { RepositoryModule } from 'src/repositories/repository.module';

@Module({
  imports: [
    MulterModule.register({
      storage: memoryStorage(),
      fileFilter: (req, file, callback) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
          return callback(new Error('Only image files are allowed!'), false);
        }
        callback(null, true);
      },
    }),
    RepositoryModule,
  ],
  controllers: [FloorPlanController],
  providers: [FloorPlanService, S3Service],
  exports: [FloorPlanService],
})
export class FloorPlanModule {}
