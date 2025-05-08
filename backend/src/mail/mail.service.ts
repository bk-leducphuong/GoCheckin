import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { Account } from 'src/account/entities/account.entity';
import { AccountDto } from 'src/account/dto/account.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  async sendOtpMail(account: Account, otp: string) {
    try {
      const templatePath = this.configService.get<string>('OTP_MAIL_PATH');
      const subject = 'Your Password Reset Code';
      await this.mailerService.sendMail({
        to: account.email,
        subject: subject,
        template: templatePath,
        context: {
          username: account.username,
          otp: otp,
          companyName: 'GoCheckin',
        },
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async sendPasswordChangedMail(account: AccountDto) {
    try {
      const templatePath = this.configService.get<string>(
        'PASSWORD_CHANGED_CONFIRMATION_MAIL_PATH',
      );
      const subject = 'Your Password Has Been Changed';
      await this.mailerService.sendMail({
        to: account.email,
        subject: subject,
        template: templatePath,
        context: {
          username: account.username,
          dateTime: new Date().toLocaleString(),
          supportEmail: 'support@gocheckin.com',
          companyName: 'GoCheckin',
        },
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
