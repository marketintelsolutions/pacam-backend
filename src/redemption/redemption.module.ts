// src/redemption/redemption.module.ts
import { Module } from "@nestjs/common";
import { RedemptionController } from "./redemption.controller";
import { RedemptionService } from "./redemption.service";
import { EmailModule } from "../email/email.module";

@Module({
  imports: [EmailModule],
  controllers: [RedemptionController],
  providers: [RedemptionService],
})
export class RedemptionModule {}
