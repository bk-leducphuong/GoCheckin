import {
  Controller,
  UseGuards,
  UseInterceptors,
  HttpStatus,
  UploadedFile,
  Post,
  Get,
  Param,
  Res,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/account/entities/account.entity';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { FloorPlanService } from './floor-plan.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';

@Controller('floor-plan')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.TENANT)
export class FloorPlanController {
  constructor(private readonly floorPlanService: FloorPlanService) {
    // Constructor logic if needed
  }

  @Post('upload')
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
  uploadImage(@UploadedFile() image: Express.Multer.File): string {
    return this.floorPlanService.uploadFloorPlanImage(image);
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
  async getFloorPlanImage(
    @Param('eventCode') eventCode: string,
    @Res() res: Response,
  ) {
    const floorPlanImage =
      await this.floorPlanService.getFloorPlanImage(eventCode);
    res.sendFile(
      floorPlanImage,
      {
        headers: {
          'Cache-Control': 'public, max-age=86400',
        },
      },
      (err) => {
        console.error(err);
      },
    );
  }
}
