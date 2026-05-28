import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class UploadConsumptionDto {
  @ApiProperty({ example: 'uuid-schedule-id' })
  @IsUUID()
  schedule_id: string;
}
