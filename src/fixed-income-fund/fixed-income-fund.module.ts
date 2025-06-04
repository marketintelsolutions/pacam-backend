import { Module } from "@nestjs/common";
import { FixedIncomeFundController } from "./fixed-income-fund.controller";
import { FixedIncomeFundService } from "./fixed-income-fund.service";
import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [ConfigModule],
  controllers: [FixedIncomeFundController],
  providers: [FixedIncomeFundService],
  exports: [FixedIncomeFundService],
})
export class FixedIncomeFundModule {}
