import {
  Injectable,
  NotFoundException,
  ConflictException,
  //   BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Guest, IdentityType } from './entities/guest.entity';
import { GuestCheckin } from './entities/guest-checkin.entity';
import { CreateGuestDto } from './dto/create-guest.dto';
import { UpdateGuestDto } from './dto/update-guest.dto';
import { CheckinDto } from './dto/checkin.dto';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import {
  GetGuestsResponseDto,
  GuestResponse,
} from './dto/get-guests-response.dto';

@Injectable()
export class GuestService {
  private readonly uploadPath = join(process.cwd(), 'uploads');

  constructor(
    @InjectRepository(Guest)
    private guestRepository: Repository<Guest>,
    @InjectRepository(GuestCheckin)
    private guestCheckinRepository: Repository<GuestCheckin>,
  ) {
    // Create uploads directory if it doesn't exist
    if (!existsSync(this.uploadPath)) {
      mkdirSync(this.uploadPath);
    }
  }

  async create(createGuestDto: CreateGuestDto): Promise<Guest> {
    try {
      // Check if guest already exists
      const existingGuest = await this.guestRepository.findOne({
        where: {
          guestCode: createGuestDto.guestCode,
          eventCode: createGuestDto.eventCode,
        },
      });

      if (existingGuest) {
        return existingGuest;
      }

      // Create a new guest record
      const newGuest = this.guestRepository.create(createGuestDto);
      return this.guestRepository.save(newGuest);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async checkin(checkinDto: CheckinDto): Promise<GuestResponse> {
    try {
      // Check if guest has already checked in
      const existingCheckin = await this.guestCheckinRepository.findOne({
        where: {
          guestCode: checkinDto.guestCode,
          pointCode: checkinDto.pointCode,
          active: true,
        },
      });
      if (existingCheckin) {
        throw new ConflictException(
          `Guest with code ${checkinDto.guestCode} has already checked in for this event`,
        );
      }

      // Check if guest exists with the provided guest code and event code
      let checkinGuest = await this.guestRepository.findOne({
        where: {
          guestCode: checkinDto.guestCode,
          eventCode: checkinDto.eventCode,
        },
      });
      if (!checkinGuest) {
        // Create a new guest record
        const newGuest = this.guestRepository.create({
          guestCode: checkinDto.guestCode,
          eventCode: checkinDto.eventCode,
          identityType: IdentityType.ID_CARD,
          imageUrl: checkinDto.imageUrl,
          description: checkinDto.notes,
        });
        await this.guestRepository.save(newGuest);
        checkinGuest = newGuest;
      }

      // Create a new checkin record
      const checkin = this.guestCheckinRepository.create({
        guestId: checkinGuest.guestId,
        guestCode: checkinDto.guestCode,
        eventCode: checkinDto.eventCode,
        pointCode: checkinDto.pointCode,
      });

      // Save the checkin record
      const checkinInfo = await this.guestCheckinRepository.save(checkin);
      return {
        guestInfo: checkinGuest,
        checkinInfo,
      };
    } catch (error) {
      console.error('Error checking in guest: ', error);
      throw error;
    }
  }

  uploadImage(image: Express.Multer.File): string {
    return image.path;
  }

  async getGuestCheckins(guestId: string): Promise<GuestCheckin[]> {
    // Find all check-ins for a specific guest
    return this.guestCheckinRepository.find({
      where: { guestId, active: true },
      relations: ['pointOfCheckin'],
      order: { checkinTime: 'DESC' },
    });
  }

  async getPocCheckins(
    pointCode: string,
    eventCode: string,
  ): Promise<GuestCheckin[]> {
    // Find all check-ins at a specific POC for a specific event
    return this.guestCheckinRepository.find({
      where: { pointCode, eventCode, active: true },
      relations: ['guest'],
      order: { checkinTime: 'DESC' },
    });
  }

  async getAllGuestsOfPoc(
    eventCode: string,
    pointCode: string,
  ): Promise<GetGuestsResponseDto> {
    const checkins = await this.guestCheckinRepository.find({
      where: { pointCode, eventCode, active: true },
      order: { checkinTime: 'DESC' },
    });

    const guestResponses = await Promise.all(
      checkins.map(async (checkin) => {
        const response = new GuestResponse();
        const guestDetails = await this.guestRepository.findOne({
          where: { guestId: checkin.guestId, enabled: true },
        });
        if (!guestDetails) return null;

        response.guestInfo = guestDetails;
        response.checkinInfo = checkin;
        return response;
      }),
    );

    return {
      guests: guestResponses.filter(
        (guest): guest is GuestResponse => guest !== null,
      ),
    };
  }

  async findAllByEvent(): Promise<Guest[]> {
    return this.guestRepository.find({
      where: {
        enabled: true,
      },
    });
  }

  async findOne(id: string): Promise<Guest> {
    const guest = await this.guestRepository.findOne({
      where: { guestId: id, enabled: true },
      relations: ['checkins', 'checkins.pointOfCheckin'],
    });

    if (!guest) {
      throw new NotFoundException(`Guest with ID ${id} not found`);
    }

    return guest;
  }

  async findByCodeAndEvent(guestCode: string): Promise<Guest> {
    const guest = await this.guestRepository.findOne({
      where: {
        enabled: true,
      },
      relations: ['checkins', 'checkins.pointOfCheckin'],
    });

    if (!guest) {
      throw new NotFoundException(
        `Guest with code ${guestCode} not found for this event`,
      );
    }

    return guest;
  }

  async update(id: string, updateGuestDto: UpdateGuestDto): Promise<Guest> {
    const guest = await this.findOne(id);

    // Update guest properties
    Object.assign(guest, updateGuestDto);

    return this.guestRepository.save(guest);
  }

  async remove(id: string): Promise<void> {
    const guest = await this.findOne(id);

    // Soft delete - just set enabled to false
    guest.enabled = false;
    await this.guestRepository.save(guest);

    // Also mark all check-ins as inactive
    await this.guestCheckinRepository.update(
      { guestId: id },
      { active: false },
    );
  }

  async getAllCheckinsByEvent(eventCode: string): Promise<GuestCheckin[]> {
    return this.guestCheckinRepository.find({
      where: { eventCode },
    });
  }

  // async removeAllByEventAndPoint(): Promise<void> {
  //   // Soft delete all guests for this event at this point
  //   await this.guestRepository.update({ enabled: false });
  // }

  // async removeAllByEvent(eventCode: string): Promise<void> {
  //   // Soft delete all guests for this event
  //   await this.guestRepository.update({ eventCode }, { enabled: false });

  //   // Also mark all check-ins for this event as inactive
  //   await this.guestCheckinRepository.update({ eventCode }, { active: false });
  // }
}
