import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsDateString, IsString, IsUUID, ArrayNotEmpty } from 'class-validator';

export class CreateScheduleDto {
  @ApiProperty({ example: 'uuid-patient-id' })
  @IsUUID()
  patient_id: string;

  @ApiProperty({ example: 'uuid-medicine-id' })
  @IsUUID()
  medicine_id: string;

  @ApiProperty({ example: '1 tablet' })
  @IsString()
  dose: string;

  @ApiProperty({ example: '2026-06-01' })
  @IsDateString()
  start_date: string;

  @ApiProperty({ example: '2026-06-30' })
  @IsDateString()
  end_date: string;

  @ApiProperty({ example: ['08:00', '12:00', '18:00'] })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  times: string[];
}
