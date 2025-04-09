import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PointOfCheckin } from './entities/poc.entity';
import { CreatePocDto } from './dto/create-poc.dto';
// import { UpdatePocDto } from './dto/update-poc.dto';
import { EventService } from 'src/event/event.service';
import { UpdatePocDto } from './dto/update-poc.dto';
import { JwtPayload } from 'src/common/interfaces/jwt-payload.interface';

@Injectable()
export class PocService {
  constructor(
    @InjectRepository(PointOfCheckin)
    private pocRepository: Repository<PointOfCheckin>,
    private eventService: EventService,
  ) {}

  async create(
    eventCode: string,
    createPocDto: CreatePocDto,
  ): Promise<PointOfCheckin> {
    // Check if POC with the same code already exists
    const existingPoc = await this.pocRepository.findOne({
      where: {
        pointCode: createPocDto.pointCode,
        eventCode: eventCode,
      },
    });

    if (existingPoc) {
      throw new ConflictException(
        `Point of Check-in with code ${createPocDto.pointCode} already exists`,
      );
    }

    const isEventCodeValid =
      await this.eventService.validateEventCode(eventCode);
    if (!isEventCodeValid) {
      throw new NotFoundException(`Event with code ${eventCode} not found`);
    }

    const newPoc = this.pocRepository.create({
      ...createPocDto,
      eventCode: eventCode,
    });
    return this.pocRepository.save(newPoc);
  }

  async validatePointCode(
    eventCode: string,
    pointCode: string,
  ): Promise<boolean> {
    const poc = await this.getPocByCode(eventCode, pointCode);
    return !!poc;
  }

  async getAllPocs(eventCode: string): Promise<PointOfCheckin[]> {
    return this.pocRepository.find({
      where: { eventCode, enabled: true },
      relations: ['account'],
    });
  }

  async findOne(pocId: string): Promise<PointOfCheckin> {
    const poc = await this.pocRepository.findOne({
      where: { pocId, enabled: true },
      relations: ['account', 'event'],
    });

    if (!poc) {
      throw new NotFoundException(
        `Point of Check-in with ID ${pocId} not found`,
      );
    }

    return poc;
  }

  async getPocByCode(
    eventCode: string,
    pointCode: string,
  ): Promise<PointOfCheckin> {
    const poc = await this.pocRepository.findOne({
      where: { eventCode, pointCode, enabled: true },
      relations: ['account', 'event'],
    });

    if (!poc) {
      throw new NotFoundException(
        `Point of Check-in with code ${pointCode} not found`,
      );
    }

    return poc;
  }

  async getPocByUserId(userId: string): Promise<PointOfCheckin> {
    const poc = await this.pocRepository.findOne({
      where: { userId, enabled: true },
    });

    if (!poc) {
      throw new NotFoundException(
        `Point of Check-in with user ID ${userId} not found`,
      );
    }
    return poc;
  }

  async update(
    pocId: string,
    updatePocDto: UpdatePocDto,
  ): Promise<PointOfCheckin> {
    const poc = await this.findOne(pocId);
    if (!poc) {
      throw new NotFoundException(
        `Point of Check-in with ID ${pocId} not found`,
      );
    }
    // Update POC properties
    Object.assign(poc, updatePocDto);

    return this.pocRepository.save(poc);
  }

  async remove(id: string): Promise<void> {
    const poc = await this.findOne(id);

    // Soft delete - just set enabled to false
    poc.enabled = false;
    await this.pocRepository.save(poc);
  }

  async validatePoc(
    user: JwtPayload,
    validatePocDto: any,
  ): Promise<PointOfCheckin> {
    const { eventCode, pocId } = validatePocDto;
    const userId = user.userId;

    const poc = await this.pocRepository.findOne({
      where: { userId, eventCode, pocId, enabled: true },
    });
    if (!poc) {
      throw new NotFoundException('Not found poc!');
    }

    return poc;
  }

  async updatePocManager(pocId: string, userId: string): Promise<void> {
    const poc = await this.pocRepository.findOne({
      where: { pocId, enabled: true },
    });

    if (!poc) {
      throw new NotFoundException('Not found poc!');
    }

    poc.userId = userId;
    await this.pocRepository.save(poc);
  }
}
