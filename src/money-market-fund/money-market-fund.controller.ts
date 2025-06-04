import {
  Controller,
  Post,
  Body,
  HttpStatus,
  HttpException,
  Logger,
  Get,
} from "@nestjs/common";
import { MoneyMarketFundService } from "./money-market-fund.service";

@Controller("money-market-fund")
export class MoneyMarketFundController {
  private readonly logger = new Logger(MoneyMarketFundController.name);

  constructor(
    private readonly moneyMarketFundService: MoneyMarketFundService
  ) {}

  @Post("submit")
  async submitMoneyMarketFundRedemption(@Body() request: any) {
    try {
      this.logger.log(
        `Received Money Market fund redemption for: ${request.formData.fullName}`
      );

      if (!request.formData || !request.pdfContent || !request.adminEmail) {
        throw new HttpException(
          "Missing required fields: formData, pdfContent, and adminEmail are required",
          HttpStatus.BAD_REQUEST
        );
      }

      const validation = this.moneyMarketFundService.validateMoneyMarketFundData(
        request.formData
      );
      if (!validation.valid) {
        throw new HttpException(
          { message: "Form validation failed", errors: validation.errors },
          HttpStatus.BAD_REQUEST
        );
      }

      const currentDate = Date.now();
      await this.moneyMarketFundService.sendMoneyMarketFundRedemption(
        request.formData,
        request.pdfContent,
        request.adminEmail,
        currentDate
      );

      if (request.formData.userEmail) {
        await this.moneyMarketFundService.sendClientConfirmationEmail(
          request.formData,
          request.pdfContent,
          currentDate
        );
      }

      return {
        success: true,
        message: "Money Market Fund redemption submitted successfully",
        referenceId: `PACAM-MONEY-MARKET-${currentDate}`,
      };
    } catch (error) {
      this.logger.error(
        "Failed to submit Money Market fund redemption",
        error.stack
      );
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        "Internal server error while processing Money Market fund redemption",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post("validate")
  async validateMoneyMarketFundData(@Body() request: any) {
    try {
      const validation = this.moneyMarketFundService.validateMoneyMarketFundData(
        request.formData
      );
      return validation;
    } catch (error) {
      this.logger.error("Validation error", error.stack);
      throw new HttpException(
        "Validation service error",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get("health")
  healthCheck() {
    return {
      status: "ok",
      service: "money-market-fund",
      timestamp: new Date().toISOString(),
    };
  }
}
