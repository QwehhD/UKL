import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, Min } from 'class-validator';

export class CreateMedicationDto {
  @ApiProperty({ example: 'Metformin' })
  @IsString()
  name: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  slot_number: number;

  @ApiProperty({ example: 100 })
  @IsInt()
  @Min(0)
  stock: number;
}
