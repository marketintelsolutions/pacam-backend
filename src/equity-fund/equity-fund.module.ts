import { Module } from "@nestjs/common";
import { EquityFundController } from "./equity-fund.controller";
import { EquityFundService } from "./equity-fund.service";
import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [ConfigModule],
  controllers: [EquityFundController],
  providers: [EquityFundService],
  exports: [EquityFundService],
})
export class EquityFundModule {}
