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
  async getAllCheckinsByEvent(eventCode: string): Promise<GuestCheckin[]> {
    return this.guestCheckinRepository.find({
      where: { eventCode },
    });
  }
}
