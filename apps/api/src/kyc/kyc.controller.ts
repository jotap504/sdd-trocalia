import {
  Controller, Get, Post, Body, Param, Query, HttpCode, HttpStatus,
} from '@nestjs/common'
import { KycService } from './kyc.service'
import { RejectKycDto } from './dto/review-kyc.dto'
import { Roles } from '../common/decorators/roles.decorator'
import { CurrentUser, type JwtPayload } from '../common/decorators/current-user.decorator'

@Controller('kyc')
@Roles('moderator', 'super_admin')
export class KycController {
  constructor(private readonly kycService: KycService) {}

  @Get('pending')
  listPending(@Query('type') type?: string) {
    return this.kycService.listPending(type)
  }

  @Post(':id/approve')
  @HttpCode(HttpStatus.OK)
  approve(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.kycService.approve(id, user.sub)
  }

  @Post(':id/reject')
  @HttpCode(HttpStatus.OK)
  reject(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: RejectKycDto,
  ) {
    return this.kycService.reject(id, user.sub, dto.reason)
  }
}
