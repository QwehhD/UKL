import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PatientService {
  constructor(private prisma: PrismaService) {}

  async getTodaySchedules(patientId: string) {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    return this.prisma.schedule.findMany({
      where: {
        patient_id: patientId,
        created_at: { gte: start, lte: end },
      },
      include: {
        medicine: true,
        doctor: { select: { email: true } },
      },
    });
  }

  async uploadConsumption(patientId: string, filePath: string, scheduleId: string) {
    const schedule = await this.prisma.schedule.findUnique({ where: { id: scheduleId } });
    if (!schedule) throw new NotFoundException('Schedule not found');

    const [consumption] = await this.prisma.$transaction([
      this.prisma.medicationConsumption.create({
        data: {
          schedule_id: scheduleId,
          patient_id: patientId,
          proof_image: filePath,
          verification_status: 'WAITING_VERIFICATION',
        },
      }),
      this.prisma.schedule.update({
        where: { id: scheduleId },
        data: { status: 'WAITING_VERIFICATION' },
      }),
    ]);

    return consumption;
  }

  async getHistory(patientId: string) {
    return this.prisma.medicationConsumption.findMany({
      where: { patient_id: patientId },
      include: {
        schedule: { include: { medicine: true } },
      },
      orderBy: { created_at: 'desc' },
    });
  }
}
