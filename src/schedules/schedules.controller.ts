import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { SchedulesService } from './schedules.service';

@ApiTags('Doctor - Schedules')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.DOCTOR)
@Controller('schedules')
export class SchedulesController {
  constructor(private schedulesService: SchedulesService) {}

  @ApiOperation({ summary: 'Create schedules for a patient (Doctor only)' })
  @ApiResponse({ status: 201, description: 'Schedules created successfully' })
  @Post()
  create(@Request() req: any, @Body() dto: CreateScheduleDto) {
    return this.schedulesService.create(req.user.id, dto);
  }
}
