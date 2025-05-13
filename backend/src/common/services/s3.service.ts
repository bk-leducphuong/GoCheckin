import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  PutObjectCommandInput,
} from '@aws-sdk/client-s3';

@Injectable()
export class S3Service {
  private s3Client: S3Client;
  private bucketName: string;

  constructor(private configService: ConfigService) {
    try {
      const bucketName = this.configService.get<string>('AWS_S3_BUCKET_NAME');
      if (!bucketName) {
        throw new Error('AWS_S3_BUCKET_NAME is not defined');
      }
      this.bucketName = bucketName;

      const region = this.configService.get<string>('AWS_REGION');
      const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID');
      const secretAccessKey = this.configService.get<string>(
        'AWS_SECRET_ACCESS_KEY',
      );

      if (!region || !accessKeyId || !secretAccessKey) {
        throw new Error('AWS credentials are not properly configured');
      }

      this.s3Client = new S3Client({
        region,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      });
    } catch (error) {
      console.error('Error initializing S3 client:', error);
      throw error;
    }
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'events',
  ): Promise<string> {
    try {
      const key = `${folder}/${Date.now()}-${file.originalname}`;

      const uploadParams: PutObjectCommandInput = {
        Bucket: this.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      };

      await this.s3Client.send(new PutObjectCommand(uploadParams));

      return key;
    } catch (error) {
      console.error('Error uploading file to S3:', error);
      throw error;
    }
  }

  async deleteFile(key: string): Promise<void> {
    try {
      const params = {
        Bucket: this.bucketName,
        Key: key,
      };

      await this.s3Client.send(new DeleteObjectCommand(params));
    } catch (error) {
      console.error('Error deleting file from S3:', error);
      throw error;
    }
  }

  getFileUrl(key: string): string {
    return `https://${this.bucketName}.s3.amazonaws.com/${key}`;
  }
}
