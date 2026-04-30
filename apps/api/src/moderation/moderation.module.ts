import { Module } from '@nestjs/common'
import { ModerationService } from './moderation.service'
import { ModerationController } from './moderation.controller'
import { ConfigModule } from '../config/config.module'

@Module({
  imports: [ConfigModule],
  controllers: [ModerationController],
  providers: [ModerationService],
})
export class ModerationModule {}
