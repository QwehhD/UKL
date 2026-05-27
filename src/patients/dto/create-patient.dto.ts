import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsInt, IsString, Min, MinLength } from 'class-validator';

export class CreatePatientDto {
  @ApiProperty({ example: 'patient@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123', minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  full_name: string;

  @ApiProperty({ example: 30 })
  @IsInt()
  @Min(1)
  age: number;

  @ApiProperty({ example: 'Diabetes' })
  @IsString()
  main_disease: string;

  @ApiProperty({ example: '081234567890' })
  @IsString()
  whatsapp_number: string;
}
