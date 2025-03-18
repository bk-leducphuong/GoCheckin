import {
  Injectable,
  NotFoundException,
  ConflictException,
  //   BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Guest } from './entities/guest.entity';
import { GuestCheckin } from './entities/guest-checkin.entity';
import { CreateGuestDto } from './dto/create-guest.dto';
import { UpdateGuestDto } from './dto/update-guest.dto';
import { CheckinDto } from './dto/checkin.dto';

@Injectable()
export class GuestService {
  constructor(
    @InjectRepository(Guest)
    private guestRepository: Repository<Guest>,
    @InjectRepository(GuestCheckin)
    private guestCheckinRepository: Repository<GuestCheckin>,
  ) {}

  async create(createGuestDto: CreateGuestDto): Promise<Guest> {
    // Check if guest with the same code already exists for the given event
    const existingGuest = await this.guestRepository.findOne({
      where: {
        guestCode: createGuestDto.guestCode,
        eventCode: createGuestDto.eventCode,
      },
    });

    if (existingGuest) {
      throw new ConflictException(
        `Guest with code ${createGuestDto.guestCode} already exists for this event`,
      );
    }

    const newGuest = this.guestRepository.create(createGuestDto);
    return this.guestRepository.save(newGuest);
  }

  async checkin(
    eventCode: string,
    pointCode: string,
    pocId: string,
    checkinDto: CheckinDto,
  ): Promise<GuestCheckin> {
    // Find the guest by code and event
    const guest = await this.guestRepository.findOne({
      where: {
        guestCode: checkinDto.guestCode,
        eventCode,
        enabled: true,
      },
    });

    if (!guest) {
      throw new NotFoundException(
        `Guest with code ${checkinDto.guestCode} not found for this event`,
      );
    }

    // Create a new checkin record
    const checkin = this.guestCheckinRepository.create({
      guestId: guest.guestId,
      pocId: checkinDto.pocId || pocId, // Use provided pocId or the one from route params
      eventCode,
      notes: checkinDto.notes,
    });

    // Save the checkin record
    const savedCheckin = await this.guestCheckinRepository.save(checkin);

    // Update the guest's last point of check-in for backward compatibility
    guest.pointCode = pointCode;
    await this.guestRepository.save(guest);

    return savedCheckin;
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
    pocId: string,
    eventCode: string,
  ): Promise<GuestCheckin[]> {
    // Find all check-ins at a specific POC for a specific event
    return this.guestCheckinRepository.find({
      where: { pocId, eventCode, active: true },
      relations: ['guest'],
      order: { checkinTime: 'DESC' },
    });
  }

  async findAllByEventAndPoint(
    eventCode: string,
    pointCode: string,
  ): Promise<Guest[]> {
    return this.guestRepository.find({
      where: {
        eventCode,
        pointCode,
        enabled: true,
      },
    });
  }

  async findAllByEvent(eventCode: string): Promise<Guest[]> {
    return this.guestRepository.find({
      where: {
        eventCode,
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

  async findByCodeAndEvent(
    guestCode: string,
    eventCode: string,
  ): Promise<Guest> {
    const guest = await this.guestRepository.findOne({
      where: {
        guestCode,
        eventCode,
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

  async removeAllByEventAndPoint(
    eventCode: string,
    pointCode: string,
  ): Promise<void> {
    // Soft delete all guests for this event at this point
    await this.guestRepository.update(
      { eventCode, pointCode },
      { enabled: false },
    );
  }

  async removeAllByEvent(eventCode: string): Promise<void> {
    // Soft delete all guests for this event
    await this.guestRepository.update({ eventCode }, { enabled: false });

    // Also mark all check-ins for this event as inactive
    await this.guestCheckinRepository.update({ eventCode }, { active: false });
  }
}
