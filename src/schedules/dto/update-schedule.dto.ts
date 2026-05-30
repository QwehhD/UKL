import { ApiPropertyOptional } from '@nestjs/swagger';
import { ScheduleStatus } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class UpdateScheduleDto {
  @ApiPropertyOptional({ example: 'uuid-medicine-id' })
  @IsOptional()
  @IsUUID()
  medicine_id?: string;

  @ApiPropertyOptional({ example: '1 tablet' })
  @IsOptional()
  @IsString()
  dose?: string;

  @ApiPropertyOptional({ example: '08:00' })
  @IsOptional()
  @IsString()
  time?: string;

  @ApiPropertyOptional({ enum: ScheduleStatus })
  @IsOptional()
  @IsEnum(ScheduleStatus)
  status?: ScheduleStatus;
}
