import { Module } from '@nestjs/common';
import { GuestController } from './guest.controller';
import { GuestService } from './guest.service';
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
  controllers: [GuestController],
  providers: [GuestService, S3Service],
  exports: [GuestService],
})
export class GuestModule {}
