import {
  Controller,
  UseGuards,
  UseInterceptors,
  HttpStatus,
  UploadedFile,
  Post,
  Get,
  Param,
  Body,
  ParseFilePipeBuilder,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/account/entities/account.entity';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { FloorPlanService } from './floor-plan.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { FloorPlanDto } from './dto/floor-plan.dto';

@Controller('floor-plan')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.TENANT)
export class FloorPlanController {
  constructor(private readonly floorPlanService: FloorPlanService) {
    // Constructor logic if needed
  }

  @Post(':eventCode/upload')
  @ApiOperation({
    summary: 'Upload Floor Plan Image',
    description: 'Upload a floor plan image to the server',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Image uploaded successfully',
    type: String,
  })
  @UseInterceptors(FileInterceptor('image'))
  uploadImage(
    @Param('eventCode') eventCode: string,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addMaxSizeValidator({ maxSize: 5 * 1024 * 1024 })
        .addFileTypeValidator({ fileType: 'image/*' })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    image: Express.Multer.File,
  ) {
    return this.floorPlanService.uploadFloorPlan(eventCode, image);
  }

  @Post()
  @ApiOperation({
    summary: 'Save floor plan',
    description: 'Save a floor plan to the server',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Floor plan saved successfully',
  })
  async saveFloorPlan(@Body() floorPlanDto: FloorPlanDto) {
    return this.floorPlanService.saveFloorPlan(floorPlanDto);
  }

  @Get(':eventCode')
  @ApiOperation({
    summary: 'Get Floor Plan Image',
    description: 'Retrieve the uploaded floor plan image',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Image retrieved successfully',
    type: String,
  })
  async getFloorPlanImage(@Param('eventCode') eventCode: string) {
    return await this.floorPlanService.getFloorPlanImage(eventCode);
  }
}
