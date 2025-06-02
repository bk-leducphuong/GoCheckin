import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { Guest, IdentityType } from './entities/guest.entity';
import { GuestCheckin } from './entities/guest-checkin.entity';
import { CheckinDto } from './dto/checkin.dto';
import { GuestResponse } from './dto/get-guests-response.dto';
import { S3Service } from 'src/common/services/s3.service';
import {
  GuestRepository,
  GuestCheckinRepository,
  EventRepository,
  PocRepository,
} from 'src/repositories';

@Injectable()
export class GuestService {
  constructor(
    private readonly guestRepository: GuestRepository,
    private readonly guestCheckinRepository: GuestCheckinRepository,
    private readonly s3Service: S3Service,
    private readonly eventRepository: EventRepository,
    private readonly pocRepository: PocRepository,
  ) {}

  async checkin(checkinDto: CheckinDto): Promise<GuestResponse> {
    try {
      const event = await this.eventRepository.findOne({
        eventCode: checkinDto.eventCode,
      });
      if (!event) {
        throw new NotFoundException('Event not found');
      }
      const poc = await this.pocRepository.findOne({
        eventId: event.eventId,
        pocCode: checkinDto.pocCode,
      });
      if (!poc) {
        throw new NotFoundException('POC not found');
      }
      // Check if guest has already checked in
      const existingCheckin = await this.guestCheckinRepository.findOne({
        guestCode: checkinDto.guestCode,
        pocId: poc.pocId,
      });
      if (existingCheckin) {
        throw new ConflictException(
          `Guest with code ${checkinDto.guestCode} has already checked in for this event`,
        );
      }

      // Check if guest exists with the provided guest code and event code
      let checkinGuest = await this.guestRepository.findOne({
        guestCode: checkinDto.guestCode,
        eventId: event.eventId,
      });
      if (!checkinGuest) {
        // Create a new guest record
        const newGuest = this.guestRepository.create({
          guestCode: checkinDto.guestCode,
          eventId: event.eventId,
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
        eventId: event.eventId,
        pocId: poc.pocId,
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

  async uploadImage(image: Express.Multer.File): Promise<string> {
    try {
      const key = await this.s3Service.uploadFile(
        image,
        `guest-images/${image.originalname}`,
      );
      return key;
    } catch (error) {
      console.error('Error uploading guest image: ', error);
      throw error;
    }
  }

  async getAllGuestsOfPoc(
    eventCode: string,
    pointCode: string,
  ): Promise<GuestResponse[]> {
    try {
      const event = await this.eventRepository.findOne({
        eventCode: eventCode,
      });
      if (!event) {
        throw new NotFoundException('Event not found');
      }
      const poc = await this.pocRepository.findOne({
        eventId: event.eventId,
        pocCode: pointCode,
      });
      if (!poc) {
        throw new NotFoundException('POC not found');
      }
      const checkins = await this.guestCheckinRepository.findAll({
        pocId: poc.pocId,
      });

      const guestResponses = await Promise.all(
        checkins.map(async (checkin) => {
          const response = new GuestResponse();
          const guestDetails = await this.guestRepository.findOne({
            guestId: checkin.guestId,
          });
          if (!guestDetails) return null;

          if (guestDetails.imageUrl) {
            guestDetails.imageUrl = this.s3Service.getFileUrl(
              guestDetails.imageUrl,
            );
          }

          response.guestInfo = guestDetails;
          response.checkinInfo = checkin;
          return response;
        }),
      );

      // Filter out null values
      return guestResponses.filter(
        (response): response is GuestResponse => response !== null,
      );
    } catch (error) {
      console.error('Error getting all guests of POC:', error);
      throw error;
    }
  }

  async getAllGuestsOfEvent(eventCode: string): Promise<GuestResponse[]> {
    try {
      const event = await this.eventRepository.findOne({
        eventCode: eventCode,
      });
      if (!event) {
        throw new NotFoundException('Event not found');
      }
      const checkins = await this.guestCheckinRepository.findAll({
        eventId: event.eventId,
      });

      const guestResponses = await Promise.all(
        checkins.map(async (checkin) => {
          const response = new GuestResponse();
          const guestDetails = await this.guestRepository.findOne({
            guestId: checkin.guestId,
          });
          if (!guestDetails) return null;

          if (guestDetails.imageUrl) {
            guestDetails.imageUrl = this.s3Service.getFileUrl(
              guestDetails.imageUrl,
            );
          }
          response.guestInfo = guestDetails;
          response.checkinInfo = checkin;
          return response;
        }),
      );

      return guestResponses.filter(
        (response): response is GuestResponse => response !== null,
      );
    } catch (error) {
      console.error('Error getting all guests of event:', error);
      throw error;
    }
  }

  async findOne(id: string): Promise<Guest> {
    try {
      const guest = await this.guestRepository.findOne({
        guestId: id,
      });

      if (!guest) {
        throw new NotFoundException(`Guest with ID ${id} not found`);
      }

      if (guest.imageUrl) {
        guest.imageUrl = this.s3Service.getFileUrl(guest.imageUrl);
      }

      return guest;
    } catch (error) {
      console.error('Error finding guest by ID:', error);
      throw error;
    }
  }

  async getAllCheckinsByEvent(eventCode: string): Promise<GuestCheckin[]> {
    try {
      const event = await this.eventRepository.findOne({
        eventCode: eventCode,
      });
      if (!event) {
        throw new NotFoundException('Event not found');
      }
      return this.guestCheckinRepository.findAll({
        eventId: event.eventId,
      });
    } catch (error) {
      console.error('Error getting all checkins by event:', error);
      throw error;
    }
  }
}
