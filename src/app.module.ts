// src/app.module.ts
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { EmailModule } from "./email/email.module";
import { RedemptionModule } from "./redemption/redemption.module";
import { EmailIndemnityController } from "./email-indemnity/email-indemnity.controller";
import { EmailIndemnityService } from "./email-indemnity/email-indemnity.service";
import { EmailIndemnityModule } from "./email-indemnity/email-indemnity.module";
import { EmailTemplateService } from "./email/email-template.service";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    EmailModule,
    RedemptionModule,
    EmailIndemnityModule,
  ],
  controllers: [AppController, EmailIndemnityController],
  providers: [AppService, EmailIndemnityService, EmailTemplateService],
})
export class AppModule {}
