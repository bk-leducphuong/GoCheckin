import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  forwardRef,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PointOfCheckin } from './entities/poc.entity';
import { CreatePocDto } from './dto/create-poc.dto';
// import { UpdatePocDto } from './dto/update-poc.dto';
import { EventService } from 'src/event/event.service';
import { UpdatePocDto } from './dto/update-poc.dto';
import { JwtPayload } from 'src/common/interfaces/jwt-payload.interface';
import { ValidatePocDto } from './dto/validate-poc.dto';
import { PocManagerDto } from './dto/poc-manager.dto';
import { AccountService } from 'src/account/account.service';
import { PocLocationsDto } from './dto/poc-locations.dto';
import { PocLocation } from './entities/poc-location.entity';
import { FloorPlanService } from 'src/floor-plan/floor-plan.service';

@Injectable()
export class PocService {
  constructor(
    @InjectRepository(PointOfCheckin)
    private pocRepository: Repository<PointOfCheckin>,
    @InjectRepository(PocLocation)
    private pocLocationRepository: Repository<PocLocation>,
    @Inject(forwardRef(() => EventService))
    private eventService: EventService,
    private accountService: AccountService,
    private floorPlanService: FloorPlanService,
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
    const poc = await this.pocRepository.findOne({
      where: { eventCode, pointCode, enabled: true },
      relations: ['account', 'event'],
    });
    return !!poc;
  }

  async getAllPocs(eventCode: string): Promise<PointOfCheckin[]> {
    return this.pocRepository.find({
      where: { eventCode, enabled: true },
      relations: ['account'],
    });
  }

  async getPocByPocId(pocId: string): Promise<PointOfCheckin> {
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

  async getPocByPocCode(
    eventCode: string,
    pointCode: string,
  ): Promise<PointOfCheckin> {
    const poc = await this.pocRepository.findOne({
      where: { eventCode, pointCode },
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
    const poc = await this.getPocByPocId(pocId);
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
    const poc = await this.getPocByPocId(id);

    // Soft delete - just set enabled to false
    poc.enabled = false;
    await this.pocRepository.save(poc);
  }

  async validatePoc(
    user: JwtPayload,
    validatePocDto: ValidatePocDto,
  ): Promise<PointOfCheckin> {
    const { eventCode, pointCode } = validatePocDto;
    if (!eventCode || !pointCode) {
      throw new BadRequestException('Event code and point code are required');
    }
    const userId = user.userId;

    const poc = await this.pocRepository.findOne({
      where: { userId, eventCode, pointCode, enabled: true },
    });
    if (!poc) {
      throw new NotFoundException('Not found poc!');
    }

    return poc;
  }

  async getPocManager(userId: string): Promise<PocManagerDto | null> {
    const pocManager = await this.accountService.findById(userId);
    if (!pocManager) {
      return null;
    }
    return pocManager;
  }

  async updatePocManager(
    eventCode: string,
    pointCode: string,
    userId: string,
  ): Promise<void> {
    await this.pocRepository.update(
      { eventCode, pointCode },
      { userId: userId },
    );
  }

  async removeAllPocs(eventCode: string): Promise<void> {
    await this.pocRepository.delete({ eventCode });
  }

  async savePocLocation(pocLocations: PocLocationsDto): Promise<void> {
    const { eventCode, locations } = pocLocations;
    const floorPlan =
      await this.floorPlanService.getFloorPlanByEventCode(eventCode);
    if (!floorPlan) {
      throw new NotFoundException(
        `Floor plan with event code ${eventCode} not found`,
      );
    }
    await this.pocLocationRepository.save(
      locations.map((location) => ({
        ...location,
        floorPlanId: floorPlan.floorPlanId,
      })),
    );
  }

  async getPocLocations(eventCode: string): Promise<PocLocation[]> {
    const floorPlan =
      await this.floorPlanService.getFloorPlanByEventCode(eventCode);
    if (!floorPlan) {
      throw new NotFoundException(
        `Floor plan with event code ${eventCode} not found`,
      );
    }
    return this.pocLocationRepository.find({
      where: { floorPlanId: floorPlan.floorPlanId },
    });
  }
}
