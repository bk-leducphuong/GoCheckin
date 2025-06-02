import { Module } from '@nestjs/common';
import { PocController } from './poc.controller';
import { PocService } from './poc.service';
import { MailModule } from 'src/mail/mail.module';
import { RepositoryModule } from 'src/repositories/repository.module';

@Module({
  imports: [MailModule, RepositoryModule],
  controllers: [PocController],
  providers: [PocService],
  exports: [PocService],
})
export class PocModule {}
