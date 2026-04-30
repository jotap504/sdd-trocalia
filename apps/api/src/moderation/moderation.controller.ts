import {
  Controller, Get, Post, Param, Query, HttpCode, HttpStatus,
} from '@nestjs/common'
import { ModerationService } from './moderation.service'
import { Roles } from '../common/decorators/roles.decorator'
import { CurrentUser, type JwtPayload } from '../common/decorators/current-user.decorator'

@Controller('moderation')
@Roles('moderator', 'super_admin')
export class ModerationController {
  constructor(private readonly moderationService: ModerationService) {}

  @Get('listings/pending')
  listPending(@Query('limit') limit?: string) {
    return this.moderationService.listPending(limit ? parseInt(limit, 10) : 50)
  }

  @Post('listings/:id/approve')
  @HttpCode(HttpStatus.OK)
  approve(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.moderationService.approve(id, user.sub)
  }

  @Post('listings/:id/reject')
  @HttpCode(HttpStatus.OK)
  reject(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.moderationService.reject(id, user.sub)
  }

  @Post('listings/:id/flag')
  @HttpCode(HttpStatus.OK)
  flag(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.moderationService.flag(id, user.sub)
  }
}
