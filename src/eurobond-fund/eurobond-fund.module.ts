import { Module } from "@nestjs/common";
import { EurobondFundController } from "./eurobond-fund.controller";
import { EurobondFundService } from "./eurobond-fund.service";
import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [ConfigModule],
  controllers: [EurobondFundController],
  providers: [EurobondFundService],
  exports: [EurobondFundService],
})
export class EurobondFundModule {}
