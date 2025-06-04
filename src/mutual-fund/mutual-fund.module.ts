import { Module } from "@nestjs/common";
import { MutualFundController } from "./mutual-fund.controller";
import { MutualFundService } from "./mutual-fund.service";
import { EmailTemplateService } from "../email/email-template.service";
import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [ConfigModule],
  controllers: [MutualFundController],
  providers: [MutualFundService, EmailTemplateService],
  exports: [MutualFundService],
})
export class MutualFundModule {}
