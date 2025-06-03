// src/email-indemnity/email-indemnity.module.ts
import { Module } from "@nestjs/common";
import { EmailIndemnityController } from "./email-indemnity.controller";
import { EmailIndemnityService } from "./email-indemnity.service";
import { EmailTemplateService } from "../email/email-template.service";
import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [ConfigModule],
  controllers: [EmailIndemnityController],
  providers: [EmailIndemnityService, EmailTemplateService],
  exports: [EmailIndemnityService],
})
export class EmailIndemnityModule {}
