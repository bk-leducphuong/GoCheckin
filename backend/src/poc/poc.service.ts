import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  forwardRef,
  Inject,
} from '@nestjs/common';
import { PocRepository } from '../repositories/poc.repository';
import { PocLocationRepository } from '../repositories/poc-location.repository';
import { PocInviteRepository } from '../repositories/poc-invite.repository';
import { PointOfCheckin } from './entities/poc.entity';
import { CreatePocDto } from './dto/create-poc.dto';
import { EventService } from 'src/event/event.service';
import { UpdatePocDto } from './dto/update-poc.dto';
import { JwtPayload } from 'src/common/interfaces/jwt-payload.interface';
import { ValidatePocDto } from './dto/validate-poc.dto';
import { PocManagerDto } from './dto/poc-manager.dto';
import { PocLocationsDto } from './dto/poc-locations.dto';
import { PocLocation } from './entities/poc-location.entity';
import { FloorPlanService } from 'src/floor-plan/floor-plan.service';
import { RegisterPocUserDto } from './dto/register-poc-user.dto';
import { MailService } from 'src/mail/mail.service';
import { InvitePocUserDto } from './dto/invite-poc-user.dto';
import { PocInvite, PocInviteStatus } from './entities/poc-invite';
import { v4 as uuidv4 } from 'uuid';
import { AccountRepository } from 'src/repositories/account.repository';

@Injectable()
export class PocService {
  constructor(
    private readonly pocRepository: PocRepository,
    private readonly pocLocationRepository: PocLocationRepository,
    private readonly pocInviteRepository: PocInviteRepository,
    private readonly accountRepository: AccountRepository,
    @Inject(forwardRef(() => EventService))
    private eventService: EventService,
    @Inject(forwardRef(() => FloorPlanService))
    private floorPlanService: FloorPlanService,
    @Inject(forwardRef(() => MailService))
    private mailService: MailService,
  ) {}

  async create(
    eventCode: string,
    createPocDto: CreatePocDto,
  ): Promise<PointOfCheckin> {
    try {
      // Check if POC with the same code already exists
      const existingPoc = await this.pocRepository.findByPointCodeAndEvent(
        createPocDto.pointCode,
        eventCode,
      );

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
      const poc = await this.pocRepository.findByPointCodeAndEventWithRelations(
        eventCode,
        pointCode,
      );
      return !!poc;
    } catch (error) {
      console.error('Error validating point code:', error);
      throw error;
    }
  }

  async getAllPocs(eventCode: string): Promise<PointOfCheckin[]> {
    try {
      return this.pocRepository.findByEventCode(eventCode);
    } catch (error) {
      console.error('Error getting all POCs:', error);
      throw error;
    }
  }

  async getPocByPocId(pocId: string): Promise<PointOfCheckin> {
    try {
      const poc = await this.pocRepository.findByPocId(pocId);

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
      const poc = await this.pocRepository.findByPointCodeAndEvent(
        pointCode,
        eventCode,
      );

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
      const pocs = await this.pocRepository.findByUserId(userId);
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
      await this.pocRepository.deleteByPocId(id);
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

      const poc = await this.pocRepository.findByUserAndEventAndPoint(
        userId,
        eventCode,
        pointCode,
      );
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
      const pocManager = await this.accountRepository.findById(userId);
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
      await this.pocRepository.deleteByEventCode(eventCode);
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
      await this.pocLocationRepository.saveMultiple(
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
      return this.pocLocationRepository.findByFloorPlanId(
        floorPlan.floorPlanId,
      );
    } catch (error) {
      console.error('Error getting POC locations:', error);
      throw error;
    }
  }

  async removePocLocations(floorPlanId: string) {
    try {
      await this.pocLocationRepository.deleteByFloorPlanId(floorPlanId);
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
      const poc = await this.pocRepository.findByPointCodeAndEvent(
        pointCode,
        eventCode,
      );
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

  async invitePocUser(invitePocUserDto: InvitePocUserDto): Promise<void> {
    try {
      const { eventCode, pointCode, email } = invitePocUserDto;
      if (!eventCode || !pointCode || !email) {
        throw new BadRequestException(
          'Event code, point code and email are required',
        );
      }

      const poc = await this.pocRepository.findByPointCodeAndEvent(
        pointCode,
        eventCode,
      );
      if (!poc) {
        throw new NotFoundException('Not found poc!');
      }

      const existingInvitedPoc =
        await this.pocInviteRepository.findByEventPointAndEmail(
          eventCode,
          pointCode,
          email,
        );
      if (existingInvitedPoc) {
        throw new BadRequestException('POC already invited!');
      }

      const inviteCode = uuidv4();

      const invitedPoc = this.pocInviteRepository.create({
        eventCode,
        pointCode,
        email,
        status: PocInviteStatus.PENDING,
        inviteCode,
      });
      await this.pocInviteRepository.save(invitedPoc);

      await this.mailService.sendPocInviteMail(
        email,
        eventCode,
        pointCode,
        inviteCode,
      );
    } catch (error) {
      console.error('Error inviting POC user:', error);
      throw error;
    }
  }

  async acceptPocInvite(user: JwtPayload, inviteCode: string): Promise<void> {
    try {
      const invitedPoc =
        await this.pocInviteRepository.findByInviteCodeAndStatus(
          inviteCode,
          PocInviteStatus.PENDING,
        );
      if (!invitedPoc) {
        throw new NotFoundException('Not found invited poc!');
      }

      await this.pocInviteRepository.update(
        { inviteCode },
        { status: PocInviteStatus.ACCEPTED },
      );

      await this.pocRepository.update(
        { eventCode: invitedPoc.eventCode, pointCode: invitedPoc.pointCode },
        { userId: user.userId },
      );
    } catch (error) {
      console.error('Error accepting POC invite:', error);
      throw error;
    }
  }

  async getPocInvite(eventCode: string, pointCode: string): Promise<PocInvite> {
    try {
      const pocInvite = await this.pocInviteRepository.findByEventAndPoint(
        eventCode,
        pointCode,
      );
      if (!pocInvite) {
        throw new NotFoundException('Not found poc invite!');
      }
      return pocInvite;
    } catch (error) {
      console.error('Error getting POC invite:', error);
      throw error;
    }
  }
}
