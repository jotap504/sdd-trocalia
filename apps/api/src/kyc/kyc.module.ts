import { Module } from '@nestjs/common'
import { KycService } from './kyc.service'
import { KycController } from './kyc.controller'
import { WalletModule } from '../wallet/wallet.module'
import { ConfigModule } from '../config/config.module'

@Module({
  imports: [WalletModule, ConfigModule],
  controllers: [KycController],
  providers: [KycService],
})
export class KycModule {}
