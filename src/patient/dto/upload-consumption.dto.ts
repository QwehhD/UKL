import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

export class UploadConsumptionDto {
  @ApiProperty({ example: 'uuid-schedule-id' })
  @IsUUID()
  schedule_id!: string;

  @IsOptional()
  proof_image?: any;
}
