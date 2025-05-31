import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { Otp } from '../auth/entities/otp.entity';

@Injectable()
export class OtpRepository {
  constructor(
    @InjectRepository(Otp)
    private readonly otpRepository: Repository<Otp>,
  ) {}

  create(data: Partial<Otp>): Otp {
    try {
      return this.otpRepository.create(data);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async save(otp: Otp): Promise<Otp> {
    try {
      return await this.otpRepository.save(otp);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findByUserIdNotExpired(userId: string): Promise<Otp | null> {
    try {
      return await this.otpRepository.findOne({
        where: {
          userId: userId,
          expriedAt: MoreThan(new Date()),
        },
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async update(conditions: Partial<Otp>, data: Partial<Otp>): Promise<void> {
    try {
      await this.otpRepository.update(conditions, data);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async remove(otp: Otp): Promise<void> {
    try {
      await this.otpRepository.remove(otp);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
