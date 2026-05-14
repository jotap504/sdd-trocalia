import {
  Controller,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  ParseFilePipeBuilder,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ListingImagesService } from './listing-images.service';
import {
  CurrentUser,
  type JwtPayload,
} from '../common/decorators/current-user.decorator';
import { ConfirmImageDto, ReorderImagesDto } from './dto/confirm-image.dto';

@Controller('listings/:listingId/images')
export class ListingImagesController {
  constructor(private readonly imagesService: ListingImagesService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.CREATED)
  async upload(
    @CurrentUser() user: JwtPayload,
    @Param('listingId') listingId: string,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({ fileType: /^image\// })
        .addMaxSizeValidator({ maxSize: 8 * 1024 * 1024 })
        .build({ errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY }),
    )
    file: { buffer: Buffer; mimetype: string; size: number },
  ) {
    return this.imagesService.upload(user.sub, listingId, file.buffer);
  }

  @Post('upload-url')
  @HttpCode(HttpStatus.OK)
  getUploadUrl(
    @CurrentUser() user: JwtPayload,
    @Param('listingId') listingId: string,
  ) {
    return this.imagesService.getUploadUrl(user.sub, listingId);
  }

  @Post('confirm')
  @HttpCode(HttpStatus.CREATED)
  confirmUpload(
    @CurrentUser() user: JwtPayload,
    @Param('listingId') listingId: string,
    @Body() dto: ConfirmImageDto,
  ) {
    return this.imagesService.confirmUpload(user.sub, listingId, dto);
  }

  @Patch('reorder')
  reorder(
    @CurrentUser() user: JwtPayload,
    @Param('listingId') listingId: string,
    @Body() dto: ReorderImagesDto,
  ) {
    return this.imagesService.reorder(user.sub, listingId, dto);
  }

  @Delete(':imageId')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @CurrentUser() user: JwtPayload,
    @Param('listingId') listingId: string,
    @Param('imageId') imageId: string,
  ) {
    return this.imagesService.remove(user.sub, listingId, imageId);
  }
}
