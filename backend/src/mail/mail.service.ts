import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { Account } from 'src/account/entities/account.entity';
import { AccountDto } from 'src/account/dto/account.dto';
import { EventService } from 'src/event/event.service';
import { PocService } from 'src/poc/poc.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
    @Inject(forwardRef(() => EventService))
    private readonly eventService: EventService,
    @Inject(forwardRef(() => PocService))
    private readonly pocService: PocService,
    private readonly configService: ConfigService,
  ) {}

  async sendOtpMail(account: Account, otp: string) {
    try {
      const templatePath =
        this.configService.get<string>('MAIL_TEMPLATE_PATH') + '/otp.hbs';
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
      const templatePath =
        this.configService.get<string>('MAIL_TEMPLATE_PATH') +
        '/password-changed-confirmation.hbs';
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

  async sendPocRegisteredMail(account: AccountDto) {
    try {
      const templatePath =
        this.configService.get<string>('MAIL_TEMPLATE_PATH') +
        '/poc-registered.hbs';
      const subject = 'You are registered as a POC';
      await this.mailerService.sendMail({
        to: account.email,
        subject: subject,
        template: templatePath,
        context: {
          username: account.username,
          companyName: 'GoCheckin',
        },
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async sendPocInviteMail(
    email: string,
    eventCode: string,
    pointCode: string,
    inviteCode: string,
  ) {
    try {
      const event = await this.eventService.getEventByCode(eventCode);
      if (!event) {
        throw new NotFoundException('Event not found');
      }

      const poc = await this.pocService.getPocByPocCode(eventCode, pointCode);
      if (!poc) {
        throw new NotFoundException('POC not found');
      }

      const templatePath =
        this.configService.get<string>('MAIL_TEMPLATE_PATH') +
        '/poc-invite.hbs';
      const subject = 'You are invited to be a POC';
      await this.mailerService.sendMail({
        to: email,
        subject: subject,
        template: templatePath,
        context: {
          recipientName: email,
          eventName: event.eventName,
          eventDate: event.startTime.toLocaleDateString(),
          eventTime: event.startTime.toLocaleTimeString(),
          eventLocation: event.venueAddress,
          pointCode: pointCode,
          pocName: poc.pointName,
          pocLocation: poc.location,
          confirmationLink: `${this.configService.get<string>(
            'CLIENT_URL',
          )}/poc/event-invite/${inviteCode}`,
          senderName: 'GoCheckin',
        },
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
