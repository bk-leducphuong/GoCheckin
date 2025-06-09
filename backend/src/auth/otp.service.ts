import { BadRequestException, Injectable } from '@nestjs/common';
import {
  OtpRepository,
  ResetTokenRepository,
  AccountRepository,
} from '../repositories';
import { hash, compare } from 'bcrypt';
import { randomInt, randomBytes } from 'crypto';
import { VerifyOtpDto } from './dto';
import { MoreThan } from 'typeorm';

@Injectable()
export class OtpService {
  constructor(
    private readonly otpRepository: OtpRepository,
    private readonly resetTokenRepository: ResetTokenRepository,
    private readonly accountRepository: AccountRepository,
  ) {}

  async generateOtp(userId: string): Promise<string> {
    try {
      // Generate a random number between 100000 and 999999
      const otp = randomInt(100000, 999999).toString();
      const hashedOtp = await hash(otp, 10);
      const storedOtp = this.otpRepository.create({
        userId: userId,
        hashedOtp: hashedOtp,
        expriedAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
        attempts: 0,
      });
      await this.otpRepository.save(storedOtp);
      return otp;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async verifyOtp(
    verifyOtpDto: VerifyOtpDto,
  ): Promise<{ resetToken: string; userId: string }> {
    try {
      const account = await this.accountRepository.findOne({
        email: verifyOtpDto.email,
      });
      if (!account) {
        throw new BadRequestException('Invalid or expired code');
      }

      const otpRecord = await this.otpRepository.findOne({
        userId: account.userId,
        expriedAt: MoreThan(new Date()),
      });

      if (!otpRecord) {
        throw new BadRequestException('Invalid or expired code');
      }

      await this.otpRepository.update(
        { userId: account.userId },
        { attempts: otpRecord.attempts + 1 },
      );

      if (otpRecord.attempts >= 3) {
        await this.otpRepository.remove(otpRecord);
        throw new BadRequestException('Too many attempts');
      }

      const isValidOtp = await compare(verifyOtpDto.otp, otpRecord.hashedOtp);

      if (!isValidOtp) {
        throw new BadRequestException('Invalid or expired code');
      }

      // Create a reset token
      const resetToken = randomBytes(32).toString('hex');
      const hashedResetToken = await hash(resetToken, 10);
      const storedResetToken = this.resetTokenRepository.create({
        userId: account.userId,
        hashedResetToken: hashedResetToken,
        expriedAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      });
      await this.resetTokenRepository.save(storedResetToken);

      await this.otpRepository.remove(otpRecord);

      return {
        userId: account.userId,
        resetToken: resetToken,
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
