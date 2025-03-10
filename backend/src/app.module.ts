import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getDatabaseConfig } from './database/config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // make configuration available throughout the app
      envFilePath: `.env.${process.env.NODE_ENV}`,
    }),
    TypeOrmModule.forRootAsync({
      // use async configuration to wait for eviroment variables to load
      imports: [ConfigModule], // inject ConfigModule to use configuration
      inject: [ConfigService], // inject ConfigService to read enviroment variable
      useFactory: (configService: ConfigService) =>
        getDatabaseConfig(configService),
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
