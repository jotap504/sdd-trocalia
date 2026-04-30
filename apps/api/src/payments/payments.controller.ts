import {
  Controller, Post, Get, Body, Headers, HttpCode, HttpStatus, RawBodyRequest, Req,
} from '@nestjs/common'
import type { Request } from 'express'
import { PaymentsService } from './payments.service'
import { CreatePreferenceDto } from './dto/create-preference.dto'
import { CurrentUser, type JwtPayload } from '../common/decorators/current-user.decorator'
import { Public } from '../common/decorators/public.decorator'

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('preferences')
  @HttpCode(HttpStatus.CREATED)
  createPreference(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreatePreferenceDto,
  ) {
    return this.paymentsService.createPreference(user.sub, dto.packageId)
  }

  @Public()
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  webhook(
    @Req() req: RawBodyRequest<Request>,
    @Body() body: Record<string, unknown>,
    @Headers('x-signature') signature?: string,
    @Headers('x-request-id') requestId?: string,
  ) {
    const sigParts = signature?.split(',')
    const ts = sigParts?.find((p) => p.startsWith('ts='))?.replace('ts=', '')
    return this.paymentsService.handleWebhook(body, signature, requestId, ts)
  }

  @Get('history')
  history(@CurrentUser() user: JwtPayload) {
    return this.paymentsService.getHistory(user.sub)
  }
}
