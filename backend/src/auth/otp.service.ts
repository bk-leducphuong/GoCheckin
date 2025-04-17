import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { Otp } from './entities/otp.entity';
import { ResetToken } from './entities/reset-token.entity';
import { hash, compare } from 'bcrypt';
import { randomInt, randomBytes } from 'crypto';
import { AccountService } from 'src/account/account.service';

@Injectable()
export class OtpService {
  constructor(
    @InjectRepository(Otp)
    private readonly otpRepository: Repository<Otp>,
    @InjectRepository(ResetToken)
    private readonly resetTokenRepository: Repository<ResetToken>,
    private readonly accountService: AccountService,
  ) {}

  async generateOtp(userId: string): Promise<string> {
    // Generate a random number between 100000 and 999999
    const otp = randomInt(100000, 999999).toString();
    const hashedOtp = await hash(otp, 10);
    const storedOtp = this.otpRepository.create({
      userId: userId,
      hashedOtp: hashedOtp,
      expriedAt: new Date(),
      attempts: 0,
    });
    await this.otpRepository.save(storedOtp);
    return otp;
  }

  async verifyOtp(
    userId: string,
    otp: string,
  ): Promise<{ resetToken: string; userId: string }> {
    const account = await this.accountService.findById(userId);
    if (!account) {
      throw new BadRequestException('Invalid or expired code');
    }

    const otpRecord = await this.otpRepository.findOne({
      where: {
        userId: userId,
        expriedAt: MoreThan(new Date()),
      },
    });

    if (!otpRecord) {
      throw new BadRequestException('Invalid or expired code');
    }

    await this.otpRepository.update(userId, {
      attempts: otpRecord.attempts + 1,
    });

    if (otpRecord.attempts >= 3) {
      await this.otpRepository.remove(otpRecord);
      throw new BadRequestException('Too many attempts');
    }

    const isValidOtp = await compare(otp, otpRecord.hashedOtp);

    if (!isValidOtp) {
      throw new BadRequestException('Invalid or expired code');
    }

    // Create a reset token
    const resetToken = randomBytes(32).toString('hex');
    const hashedResetToken = await hash(resetToken, 10);
    const storedResetToken = this.resetTokenRepository.create({
      userId: userId,
      hashedResetToken: hashedResetToken,
      expriedAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    });
    await this.resetTokenRepository.save(storedResetToken);

    await this.otpRepository.remove(otpRecord);

    return {
      userId: userId,
      resetToken: resetToken,
    };
  }
}
