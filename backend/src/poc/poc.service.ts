import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Poc } from './entities/poc.entity';
import {
  CreatePocDto,
  UpdatePocDto,
  ValidatePocDto,
  PocManagerDto,
  PocLocationsDto,
  RegisterPocUserDto,
  InvitePocUserDto,
} from './dto';
import { JwtPayload } from 'src/common/interfaces/jwt-payload.interface';
import { PocLocation } from './entities/poc-location.entity';
import { MailService } from 'src/mail/mail.service';
import { PocInvite, PocInviteStatus } from './entities/poc-invite.entity';
import { v4 as uuidv4 } from 'uuid';
import {
  PocRepository,
  PocLocationRepository,
  PocInviteRepository,
  AccountRepository,
  EventRepository,
  FloorPlanRepository,
} from 'src/repositories';

@Injectable()
export class PocService {
  constructor(
    private readonly pocRepository: PocRepository,
    private readonly pocLocationRepository: PocLocationRepository,
    private readonly pocInviteRepository: PocInviteRepository,
    private readonly accountRepository: AccountRepository,
    private readonly eventRepository: EventRepository,
    private readonly floorPlanRepository: FloorPlanRepository,
    private readonly mailService: MailService,
  ) {}

  async create(eventCode: string, createPocDto: CreatePocDto): Promise<Poc> {
    try {
      const event = await this.eventRepository.findOne({
        eventCode: eventCode,
      });
      if (!event) {
        throw new NotFoundException(`Event with code ${eventCode} not found`);
      }

      const newPoc = this.pocRepository.create({
        ...createPocDto,
        eventId: event.eventId,
      });
      return this.pocRepository.save(newPoc);
    } catch (error) {
      console.error('Error creating POC:', error);
      throw error;
    }
  }

  async validatePointCode(
    eventCode: string,
    pocCode: string,
  ): Promise<boolean> {
    try {
      const event = await this.eventRepository.findOne({
        eventCode: eventCode,
      });
      if (!event) {
        throw new NotFoundException(`Event with code ${eventCode} not found`);
      }

      const poc = await this.pocRepository.findOne({
        eventId: event.eventId,
        pocCode: pocCode,
      });
      return !!poc;
    } catch (error) {
      console.error('Error validating point code:', error);
      throw error;
    }
  }

  async getAllPocs(eventCode: string): Promise<Poc[]> {
    try {
      const event = await this.eventRepository.findOne({
        eventCode: eventCode,
      });
      if (!event) {
        throw new NotFoundException(`Event with code ${eventCode} not found`);
      }
      return this.pocRepository.findAll({ eventId: event.eventId });
    } catch (error) {
      console.error('Error getting all POCs:', error);
      throw error;
    }
  }

  async getPocByPocId(pocId: string): Promise<Poc> {
    try {
      const poc = await this.pocRepository.findOne({
        pocId: pocId,
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

  async getPocByPocCode(eventCode: string, pocCode: string): Promise<Poc> {
    try {
      const event = await this.eventRepository.findOne({
        eventCode: eventCode,
      });
      if (!event) {
        throw new NotFoundException(`Event with code ${eventCode} not found`);
      }
      const poc = await this.pocRepository.findOne({
        eventId: event.eventId,
        pocCode: pocCode,
      });

      if (!poc) {
        throw new NotFoundException(
          `Point of Check-in with code ${pocCode} not found`,
        );
      }

      return poc;
    } catch (error) {
      console.error('Error getting POC by POC code:', error);
      throw error;
    }
  }

  async getPocsByUserId(userId: string): Promise<Poc[]> {
    try {
      const pocs = await this.pocRepository.findAll({ userId: userId });
      return pocs.length > 0 ? pocs : [];
    } catch (error) {
      console.error('Error getting POC by user ID:', error);
      throw error;
    }
  }

  async update(pocId: string, updatePocDto: UpdatePocDto): Promise<Poc> {
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
      await this.pocRepository.delete({ pocId: id });
    } catch (error) {
      console.error('Error removing POC:', error);
      throw error;
    }
  }

  async validatePoc(
    user: JwtPayload,
    validatePocDto: ValidatePocDto,
  ): Promise<Poc> {
    try {
      const { eventCode, pocCode } = validatePocDto;
      const event = await this.eventRepository.findOne({
        eventCode: eventCode,
      });
      if (!event) {
        throw new NotFoundException(`Event with code ${eventCode} not found`);
      }

      const poc = await this.pocRepository.findOne({
        userId: user.userId,
        eventId: event.eventId,
        pocCode: pocCode,
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
      const pocManager = await this.accountRepository.findOne({
        userId: userId,
      });
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
    pocCode: string,
    userId: string,
  ): Promise<void> {
    try {
      const event = await this.eventRepository.findOne({
        eventCode: eventCode,
      });
      if (!event) {
        throw new NotFoundException(`Event with code ${eventCode} not found`);
      }

      await this.pocRepository.update(
        { eventId: event.eventId, pocCode: pocCode },
        { userId: userId },
      );
    } catch (error) {
      console.error('Error updating POC manager:', error);
      throw error;
    }
  }

  async removeAllPocs(eventCode: string): Promise<void> {
    try {
      const event = await this.eventRepository.findOne({
        eventCode: eventCode,
      });
      if (!event) {
        throw new NotFoundException(`Event with code ${eventCode} not found`);
      }
      await this.pocRepository.delete({ eventId: event.eventId });
    } catch (error) {
      console.error('Error removing all POCs:', error);
      throw error;
    }
  }

  async savePocLocation(pocLocations: PocLocationsDto): Promise<void> {
    try {
      const { eventCode, locations } = pocLocations;
      const event = await this.eventRepository.findOne({
        eventCode: eventCode,
      });
      if (!event) {
        throw new NotFoundException(`Event with code ${eventCode} not found`);
      }
      const floorPlan = await this.floorPlanRepository.findOne({
        eventId: event.eventId,
      });
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
      const event = await this.eventRepository.findOne({
        eventCode: eventCode,
      });
      if (!event) {
        throw new NotFoundException(`Event with code ${eventCode} not found`);
      }
      const floorPlan = await this.floorPlanRepository.findOne({
        eventId: event.eventId,
      });
      if (!floorPlan) {
        throw new NotFoundException(
          `Floor plan with event code ${eventCode} not found`,
        );
      }
      return this.pocLocationRepository.findAll({
        floorPlanId: floorPlan.floorPlanId,
      });
    } catch (error) {
      console.error('Error getting POC locations:', error);
      throw error;
    }
  }

  async removePocLocations(floorPlanId: string) {
    try {
      await this.pocLocationRepository.delete({
        floorPlanId: floorPlanId,
      });
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
      const { eventCode, pocCode } = registerPocUserDto;
      const event = await this.eventRepository.findOne({
        eventCode: eventCode,
      });
      if (!event) {
        throw new NotFoundException(`Event with code ${eventCode} not found`);
      }
      const poc = await this.pocRepository.findOne({
        eventId: event.eventId,
        pocCode: pocCode,
      });
      if (!poc) {
        throw new NotFoundException('Not found poc!');
      }

      if (poc.userId) {
        throw new BadRequestException('POC already registered!');
      }

      const userId = user.userId;
      await this.pocRepository.update(
        { eventId: event.eventId, pocCode: pocCode },
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
      const { eventCode, pocCode, email } = invitePocUserDto;
      const event = await this.eventRepository.findOne({
        eventCode: eventCode,
      });
      if (!event) {
        throw new NotFoundException(`Event with code ${eventCode} not found`);
      }

      const poc = await this.pocRepository.findOne({
        eventId: event.eventId,
        pocCode: pocCode,
      });
      if (!poc) {
        throw new NotFoundException('Not found poc!');
      }

      const inviteCode = uuidv4();

      const invitedPoc = this.pocInviteRepository.create({
        eventId: event.eventId,
        pocId: poc.pocId,
        email,
        status: PocInviteStatus.PENDING,
        inviteCode,
      });
      await this.pocInviteRepository.save(invitedPoc);

      await this.mailService.sendPocInviteMail(
        email,
        eventCode,
        pocCode,
        inviteCode,
      );
    } catch (error) {
      console.error('Error inviting POC user:', error);
      throw error;
    }
  }

  async acceptPocInvite(user: JwtPayload, inviteCode: string): Promise<void> {
    try {
      const pocInvite = await this.pocInviteRepository.findOne({
        inviteCode,
        status: PocInviteStatus.PENDING,
      });
      if (!pocInvite) {
        throw new NotFoundException('Not found poc invite!');
      }

      await this.pocInviteRepository.update(
        { inviteCode, status: PocInviteStatus.PENDING },
        { status: PocInviteStatus.ACCEPTED },
      );

      await this.pocRepository.update(
        { eventId: pocInvite.eventId, pocId: pocInvite.pocId },
        { userId: user.userId },
      );
    } catch (error) {
      console.error('Error accepting POC invite:', error);
      throw error;
    }
  }

  async getPocInvite(eventCode: string, pocCode: string): Promise<PocInvite> {
    try {
      const event = await this.eventRepository.findOne({
        eventCode: eventCode,
      });
      if (!event) {
        throw new NotFoundException(`Event with code ${eventCode} not found`);
      }

      const poc = await this.pocRepository.findOne({
        eventId: event.eventId,
        pocCode: pocCode,
      });
      if (!poc) {
        throw new NotFoundException('Not found poc!');
      }

      const pocInvite = await this.pocInviteRepository.findOne({
        eventId: event.eventId,
        pocId: poc.pocId,
      });
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
