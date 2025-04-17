import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { Account } from 'src/account/entities/account.entity';
import { AccountDto } from 'src/account/dto/account.dto';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendOtpMail(account: Account, otp: string) {
    const templatePath = `${__dirname}/templates/otp.hbs`;
    const subject = 'Your Password Reset Code';
    await this.mailerService.sendMail({
      to: account.email,
      subject: subject,
      template: templatePath,
      context: {
        account,
        otp,
      },
    });
  }

  async sendPasswordChangedMail(account: AccountDto) {
    const templatePath = `${__dirname}/password-changed-confirmation.hbs`;
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
  }
}
