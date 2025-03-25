import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GuestController } from './guest.controller';
import { GuestService } from './guest.service';
import { Guest } from './entities/guest.entity';
import { GuestCheckin } from './entities/guest-checkin.entity';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Module({
  imports: [
    TypeOrmModule.forFeature([Guest, GuestCheckin]),
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads', // Destination folder for uploads
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
          return callback(new Error('Only image files are allowed!'), false);
        }
        callback(null, true);
      },
    }),
  ],
  controllers: [GuestController],
  providers: [GuestService],
  exports: [GuestService],
})
export class GuestModule {}
