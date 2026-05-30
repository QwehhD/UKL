import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMedicationDto } from './dto/create-medication.dto';
import { UpdateMedicationDto } from './dto/update-medication.dto';

@Injectable()
export class MedicationsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.medicine.findMany({
      orderBy: { slot_number: 'asc' },
      include: { schedules: { select: { id: true, status: true } } },
    });
  }

  async findOne(id: string) {
    const medicine = await this.prisma.medicine.findUnique({
      where: { id },
      include: { schedules: { select: { id: true, status: true } } },
    });
    if (!medicine) throw new NotFoundException('Medication not found');
    return medicine;
  }

  async create(dto: CreateMedicationDto) {
    const exists = await this.prisma.medicine.findUnique({
      where: { slot_number: dto.slot_number },
    });
    if (exists) throw new ConflictException('Slot number already in use');

    return this.prisma.medicine.create({ data: dto });
  }

  async update(id: string, dto: UpdateMedicationDto) {
    const medicine = await this.prisma.medicine.findUnique({ where: { id } });
    if (!medicine) throw new NotFoundException('Medication not found');

    if (dto.slot_number !== undefined && dto.slot_number !== medicine.slot_number) {
      const slotExists = await this.prisma.medicine.findUnique({
        where: { slot_number: dto.slot_number },
      });
      if (slotExists) throw new ConflictException('Slot number already in use');
    }

    return this.prisma.medicine.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    const medicine = await this.prisma.medicine.findUnique({ where: { id } });
    if (!medicine) throw new NotFoundException('Medication not found');

    await this.prisma.medicine.delete({ where: { id } });
    return { message: 'Medication deleted successfully' };
  }
}
