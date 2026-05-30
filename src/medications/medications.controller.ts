import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CreateMedicationDto } from './dto/create-medication.dto';
import { UpdateMedicationDto } from './dto/update-medication.dto';
import { MedicationsService } from './medications.service';

@ApiTags('Doctor - Medications')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.DOCTOR)
@Controller('medications')
export class MedicationsController {
  constructor(private medicationsService: MedicationsService) {}

  @ApiOperation({ summary: 'Get all medications with stock info (Doctor only)' })
  @ApiResponse({ status: 200, description: 'List of medications' })
  @Get()
  findAll() {
    return this.medicationsService.findAll();
  }

  @ApiOperation({ summary: 'Get medication by ID with full info (Doctor only)' })
  @ApiResponse({ status: 200, description: 'Medication detail' })
  @ApiResponse({ status: 404, description: 'Medication not found' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.medicationsService.findOne(id);
  }

  @ApiOperation({ summary: 'Create a new medication (Doctor only)' })
  @ApiResponse({ status: 201, description: 'Medication created successfully' })
  @ApiResponse({ status: 409, description: 'Slot number already in use' })
  @Post()
  create(@Body() dto: CreateMedicationDto) {
    return this.medicationsService.create(dto);
  }

  @ApiOperation({ summary: 'Update medication (Doctor only)' })
  @ApiResponse({ status: 200, description: 'Medication updated successfully' })
  @ApiResponse({ status: 404, description: 'Medication not found' })
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateMedicationDto) {
    return this.medicationsService.update(id, dto);
  }

  @ApiOperation({ summary: 'Delete medication (Doctor only)' })
  @ApiResponse({ status: 200, description: 'Medication deleted successfully' })
  @ApiResponse({ status: 404, description: 'Medication not found' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.medicationsService.remove(id);
  }
}
