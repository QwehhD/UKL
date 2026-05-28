import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';

@Injectable()
export class SchedulesService {
  constructor(private prisma: PrismaService) {}

  async create(doctorId: string, dto: CreateScheduleDto) {
    const patient = await this.prisma.user.findUnique({ where: { id: dto.patient_id } });
    if (!patient) throw new NotFoundException(`Patient with id ${dto.patient_id} not found`);

    const medicine = await this.prisma.medicine.findUnique({ where: { id: dto.medicine_id } });
    if (!medicine) throw new NotFoundException(`Medicine with id ${dto.medicine_id} not found`);

    const records = await this.prisma.$transaction(
      dto.times.map((time) =>
        this.prisma.schedule.create({
          data: {
            doctor_id: doctorId,
            patient_id: dto.patient_id,
            medicine_id: dto.medicine_id,
            dose: dto.dose,
            time,
            status: 'PENDING',
          },
        }),
      ),
    );
    return records;
  }
}
