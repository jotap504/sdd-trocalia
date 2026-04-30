import { Module } from '@nestjs/common'
import { ListingsService } from './listings.service'
import { ListingsController } from './listings.controller'
import { WalletModule } from '../wallet/wallet.module'

@Module({
  imports: [WalletModule],
  controllers: [ListingsController],
  providers: [ListingsService],
  exports: [ListingsService],
})
export class ListingsModule {}
