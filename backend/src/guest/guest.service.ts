import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Guest } from './entities/guest.entity';
import { CreateGuestDto } from './dto/create-guest.dto';
import { UpdateGuestDto } from './dto/update-guest.dto';

@Injectable()
export class GuestService {
  constructor(
    @InjectRepository(Guest)
    private guestRepository: Repository<Guest>,
  ) {}

  async create(createGuestDto: CreateGuestDto): Promise<Guest> {
    // Check if guest with the same code already exists
    const existingGuest = await this.guestRepository.findOne({
      where: { guestCode: createGuestDto.guestCode },
    });

    if (existingGuest) {
      throw new ConflictException(
        `Guest with code ${createGuestDto.guestCode} already exists`,
      );
    }

    const newGuest = this.guestRepository.create(createGuestDto);
    return this.guestRepository.save(newGuest);
  }

  async findAll(): Promise<Guest[]> {
    return this.guestRepository.find({
      where: { enabled: true },
    });
  }

  async findOne(id: string): Promise<Guest> {
    const guest = await this.guestRepository.findOne({
      where: { guestId: id, enabled: true },
    });

    if (!guest) {
      throw new NotFoundException(`Guest with ID ${id} not found`);
    }

    return guest;
  }

  async findByCode(code: string): Promise<Guest> {
    const guest = await this.guestRepository.findOne({
      where: { guestCode: code, enabled: true },
    });

    if (!guest) {
      throw new NotFoundException(`Guest with code ${code} not found`);
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
  }

  async removeAll(): Promise<void> {
    await this.guestRepository.update({}, { enabled: false });
  }
}
