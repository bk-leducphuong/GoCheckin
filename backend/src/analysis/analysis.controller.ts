import { Controller, Get, Query, UseGuards, HttpStatus } from '@nestjs/common';
import { AnalysisService } from './analysis.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../account/entities/account.entity';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { EventCheckinAnalytics } from './entities/event-checkin-analytics.entity';
import { PointCheckinAnalytics } from './entities/point-checkin-analytics.entity';

@Controller('analysis')
@ApiTags('analysis')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AnalysisController {
  constructor(private readonly analysisService: AnalysisService) {}

  @Get('event')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get all event check-in analytics',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns all event check-in analytics',
    type: [EventCheckinAnalytics],
  })
  async getAllEventCheckinAnalytics(
    @Query('eventCode') eventCode: string,
    @Query('intervalDuration')
    intervalDuration: 'hourly' | '15min' | '30min' | 'daily' = 'hourly',
  ): Promise<EventCheckinAnalytics[]> {
    return this.analysisService.analyzeEventCheckin(
      eventCode,
      intervalDuration,
    );
  }

  @Get('point')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get all point check-in analytics',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns all point check-in analytics',
    type: [PointCheckinAnalytics],
  })
  async getAllPointCheckinAnalytics(
    @Query('eventCode') eventCode: string,
    @Query('intervalDuration')
    intervalDuration: 'hourly' | '15min' | '30min' | 'daily' = 'hourly',
  ): Promise<PointCheckinAnalytics[]> {
    return this.analysisService.analyzePointCheckin(
      eventCode,
      intervalDuration,
    );
  }
}
