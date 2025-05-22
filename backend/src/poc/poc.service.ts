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
import { EventService } from 'src/event/event.service';
import { UpdatePocDto } from './dto/update-poc.dto';
import { JwtPayload } from 'src/common/interfaces/jwt-payload.interface';
import { ValidatePocDto } from './dto/validate-poc.dto';
import { PocManagerDto } from './dto/poc-manager.dto';
import { AccountService } from 'src/account/account.service';
import { PocLocationsDto } from './dto/poc-locations.dto';
import { PocLocation } from './entities/poc-location.entity';
import { FloorPlanService } from 'src/floor-plan/floor-plan.service';
import { RegisterPocUserDto } from './dto/register-poc-user.dto';
import { MailService } from 'src/mail/mail.service';

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
    @Inject(forwardRef(() => FloorPlanService))
    private floorPlanService: FloorPlanService,
    private mailService: MailService,
  ) {}

  async create(
    eventCode: string,
    createPocDto: CreatePocDto,
  ): Promise<PointOfCheckin> {
    try {
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
    } catch (error) {
      console.error('Error creating POC:', error);
      throw error;
    }
  }

  async validatePointCode(
    eventCode: string,
    pointCode: string,
  ): Promise<boolean> {
    try {
      const poc = await this.pocRepository.findOne({
        where: { eventCode, pointCode, enabled: true },
        relations: ['account', 'event'],
      });
      return !!poc;
    } catch (error) {
      console.error('Error validating point code:', error);
      throw error;
    }
  }

  async getAllPocs(eventCode: string): Promise<PointOfCheckin[]> {
    try {
      return this.pocRepository.find({
        where: { eventCode, enabled: true },
        relations: ['account'],
      });
    } catch (error) {
      console.error('Error getting all POCs:', error);
      throw error;
    }
  }

  async getPocByPocId(pocId: string): Promise<PointOfCheckin> {
    try {
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
    } catch (error) {
      console.error('Error getting POC by POC ID:', error);
      throw error;
    }
  }

  async getPocByPocCode(
    eventCode: string,
    pointCode: string,
  ): Promise<PointOfCheckin> {
    try {
      const poc = await this.pocRepository.findOne({
        where: { eventCode, pointCode },
      });

      if (!poc) {
        throw new NotFoundException(
          `Point of Check-in with code ${pointCode} not found`,
        );
      }

      return poc;
    } catch (error) {
      console.error('Error getting POC by POC code:', error);
      throw error;
    }
  }

  async getPocsByUserId(userId: string): Promise<PointOfCheckin[]> {
    try {
      const pocs = await this.pocRepository.find({
        where: { userId, enabled: true },
      });

      return pocs.length > 0 ? pocs : [];
    } catch (error) {
      console.error('Error getting POC by user ID:', error);
      throw error;
    }
  }

  async update(
    pocId: string,
    updatePocDto: UpdatePocDto,
  ): Promise<PointOfCheckin> {
    try {
      const poc = await this.getPocByPocId(pocId);
      if (!poc) {
        throw new NotFoundException(
          `Point of Check-in with ID ${pocId} not found`,
        );
      }
      // Update POC properties
      Object.assign(poc, updatePocDto);

      return this.pocRepository.save(poc);
    } catch (error) {
      console.error('Error updating POC:', error);
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const poc = await this.getPocByPocId(id);

      // Soft delete - just set enabled to false
      poc.enabled = false;
      await this.pocRepository.save(poc);
    } catch (error) {
      console.error('Error removing POC:', error);
      throw error;
    }
  }

  async validatePoc(
    user: JwtPayload,
    validatePocDto: ValidatePocDto,
  ): Promise<PointOfCheckin> {
    try {
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
    } catch (error) {
      console.error('Error validating POC:', error);
      throw error;
    }
  }

  async getPocManager(userId: string): Promise<PocManagerDto | null> {
    try {
      const pocManager = await this.accountService.findById(userId);
      if (!pocManager) {
        return null;
      }
      return pocManager;
    } catch (error) {
      console.error('Error getting POC manager:', error);
      throw error;
    }
  }

  async updatePocManager(
    eventCode: string,
    pointCode: string,
    userId: string,
  ): Promise<void> {
    try {
      await this.pocRepository.update(
        { eventCode, pointCode },
        { userId: userId },
      );
    } catch (error) {
      console.error('Error updating POC manager:', error);
      throw error;
    }
  }

  async removeAllPocs(eventCode: string): Promise<void> {
    try {
      await this.pocRepository.delete({ eventCode });
    } catch (error) {
      console.error('Error removing all POCs:', error);
      throw error;
    }
  }

  async savePocLocation(pocLocations: PocLocationsDto): Promise<void> {
    try {
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
    } catch (error) {
      console.error('Error saving POC locations:', error);
      throw error;
    }
  }

  async getPocLocations(eventCode: string): Promise<PocLocation[]> {
    try {
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
    } catch (error) {
      console.error('Error getting POC locations:', error);
      throw error;
    }
  }

  async removePocLocations(floorPlanId: string) {
    try {
      await this.pocLocationRepository.delete({ floorPlanId });
    } catch (error) {
      console.error('Error removing POC locations:', error);
      throw error;
    }
  }

  async registerPocUser(
    user: JwtPayload,
    registerPocUserDto: RegisterPocUserDto,
  ): Promise<void> {
    try {
      const { eventCode, pointCode } = registerPocUserDto;
      const poc = await this.pocRepository.findOne({
        where: { eventCode, pointCode },
      });
      if (!poc) {
        throw new NotFoundException('Not found poc!');
      }

      if (poc.userId) {
        throw new BadRequestException('POC already registered!');
      }

      const userId = user.userId;
      await this.pocRepository.update(
        { eventCode, pointCode },
        { userId: userId },
      );

      // await this.mailService.sendPocRegisteredMail(poc);
    } catch (error) {
      console.error('Error registering POC user:', error);
      throw error;
    }
  }
}
