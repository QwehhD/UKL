import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class RejectConsumptionDto {
  @ApiProperty({ example: 'Proof image is unclear' })
  @IsString()
  @IsNotEmpty()
  rejection_reason: string;
}
