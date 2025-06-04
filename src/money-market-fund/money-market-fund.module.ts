import { Module } from "@nestjs/common";
import { MoneyMarketFundController } from "./money-market-fund.controller";
import { MoneyMarketFundService } from "./money-market-fund.service";
import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [ConfigModule],
  controllers: [MoneyMarketFundController],
  providers: [MoneyMarketFundService],
  exports: [MoneyMarketFundService],
})
export class MoneyMarketFundModule {}
