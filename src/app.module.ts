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
import { CorporateInvestmentModule } from './corporate-investment/corporate-investment.module';
import { MutualFundModule } from './mutual-fund/mutual-fund.module';
import { EquityFundModule } from './equity-fund/equity-fund.module';
import { EurobondFundModule } from './eurobond-fund/eurobond-fund.module';
import { MoneyMarketFundModule } from './money-market-fund/money-market-fund.module';
import { FixedIncomeFundModule } from './fixed-income-fund/fixed-income-fund.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    EmailModule,
    RedemptionModule,
    EmailIndemnityModule,
    CorporateInvestmentModule,
    MutualFundModule,
    EquityFundModule,
    EurobondFundModule,
    MoneyMarketFundModule,
    FixedIncomeFundModule,
  ],
  controllers: [AppController, EmailIndemnityController],
  providers: [AppService, EmailIndemnityService, EmailTemplateService],
})
export class AppModule {}
