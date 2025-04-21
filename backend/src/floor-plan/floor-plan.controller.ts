import {
  Controller,
  UseGuards,
  UseInterceptors,
  HttpStatus,
  UploadedFile,
  Post,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/account/entities/account.entity';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { FloorPlanService } from './floor-plan.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

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
}
