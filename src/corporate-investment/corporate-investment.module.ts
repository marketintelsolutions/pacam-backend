// src/corporate-investment/corporate-investment.module.ts
import { Module } from "@nestjs/common";
import { CorporateInvestmentController } from "./corporate-investment.controller";
import { CorporateInvestmentService } from "./corporate-investment.service";
import { EmailTemplateService } from "../email/email-template.service";
import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [ConfigModule],
  controllers: [CorporateInvestmentController],
  providers: [CorporateInvestmentService, EmailTemplateService],
  exports: [CorporateInvestmentService],
})
export class CorporateInvestmentModule {}
