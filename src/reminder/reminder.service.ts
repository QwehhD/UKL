import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReminderService {
  private readonly logger = new Logger(ReminderService.name);

  constructor(private prisma: PrismaService) {}

  @Cron('* * * * *')
  async sendMedicationReminders() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const currentTime = `${hours}:${minutes}`;

    const schedules = await this.prisma.schedule.findMany({
      where: { time: currentTime, status: 'PENDING' },
      include: {
        patient: {
          include: { patientProfile: true },
        },
        medicine: true,
      },
    });

    for (const schedule of schedules) {
      const phone = schedule.patient.patientProfile?.whatsapp_number ?? 'unknown';
      const name = schedule.patient.patientProfile?.full_name ?? schedule.patient.email;
      this.logger.log(
        `[WhatsApp] To: ${phone} | Message: Halo ${name}, waktunya minum obat ${schedule.medicine.name} (${schedule.dose}). Jangan lupa ya!`,
      );
    }
  }
}
