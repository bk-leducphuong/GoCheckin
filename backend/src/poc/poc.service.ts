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

@Injectable()
export class PocService {
  constructor(
    @InjectRepository(PointOfCheckin)
    private pocRepository: Repository<PointOfCheckin>,
    private eventService: EventService,
  ) {}

  async create(createPocDto: CreatePocDto): Promise<PointOfCheckin> {
    // Check if POC with the same code already exists
    const existingPoc = await this.pocRepository.findOne({
      where: { pointCode: createPocDto.pointCode },
    });

    if (existingPoc) {
      throw new ConflictException(
        `Point of Check-in with code ${createPocDto.pointCode} already exists`,
      );
    }

    const isEventCodeValid = await this.eventService.validateEventCode(
      createPocDto.eventCode,
    );
    if (!isEventCodeValid) {
      throw new NotFoundException(
        `Event with code ${createPocDto.eventCode} not found`,
      );
    }

    const newPoc = this.pocRepository.create(createPocDto);
    return this.pocRepository.save(newPoc);
  }

  async validatePointCode(pointCode: string): Promise<boolean> {
    const poc = await this.findByCode(pointCode);
    return !!poc;
  }

  async findAllByEvent(eventCode: string): Promise<PointOfCheckin[]> {
    return this.pocRepository.find({
      where: { eventCode, enabled: true },
      relations: ['account'],
    });
  }

  async findOne(id: string): Promise<PointOfCheckin> {
    const poc = await this.pocRepository.findOne({
      where: { pocId: id, enabled: true },
      relations: ['account', 'event'],
    });

    if (!poc) {
      throw new NotFoundException(`Point of Check-in with ID ${id} not found`);
    }

    return poc;
  }

  async findByCode(code: string): Promise<PointOfCheckin> {
    const poc = await this.pocRepository.findOne({
      where: { pointCode: code, enabled: true },
      relations: ['account', 'event'],
    });

    if (!poc) {
      throw new NotFoundException(
        `Point of Check-in with code ${code} not found`,
      );
    }

    return poc;
  }

  // async update(
  //   updatePocDto: UpdatePocDto,
  // ): Promise<PointOfCheckin> {
  //   const poc = await this.findOne(id);

  //   // Update POC properties
  //   Object.assign(poc, updatePocDto);

  //   return this.pocRepository.save(poc);
  // }

  async remove(id: string): Promise<void> {
    const poc = await this.findOne(id);

    // Soft delete - just set enabled to false
    poc.enabled = false;
    await this.pocRepository.save(poc);
  }
}
