import {
  Controller,
  Post,
  Body,
  HttpStatus,
  HttpException,
  Logger,
  Get,
} from "@nestjs/common";
import { EquityFundService } from "./equity-fund.service";

@Controller("equity-fund")
export class EquityFundController {
  private readonly logger = new Logger(EquityFundController.name);

  constructor(private readonly equityFundService: EquityFundService) {}

  @Post("submit")
  async submitEquityFundRedemption(@Body() request: any) {
    try {
      this.logger.log(
        `Received equity fund redemption for: ${request.formData.fullName}`
      );

      if (!request.formData || !request.pdfContent || !request.adminEmail) {
        throw new HttpException(
          "Missing required fields: formData, pdfContent, and adminEmail are required",
          HttpStatus.BAD_REQUEST
        );
      }

      const validation = this.equityFundService.validateEquityFundData(
        request.formData
      );
      if (!validation.valid) {
        throw new HttpException(
          { message: "Form validation failed", errors: validation.errors },
          HttpStatus.BAD_REQUEST
        );
      }

      const currentDate = Date.now();
      await this.equityFundService.sendEquityFundRedemption(
        request.formData,
        request.pdfContent,
        request.adminEmail,
        currentDate
      );

      if (request.formData.userEmail) {
        await this.equityFundService.sendClientConfirmationEmail(
          request.formData,
          request.pdfContent,
          currentDate
        );
      }

      return {
        success: true,
        message: "Equity Fund redemption submitted successfully",
        referenceId: `PACAM-EQUITY-${currentDate}`,
      };
    } catch (error) {
      this.logger.error("Failed to submit equity fund redemption", error.stack);
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        "Internal server error while processing equity fund redemption",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post("validate")
  async validateEquityFundData(@Body() request: any) {
    try {
      const validation = this.equityFundService.validateEquityFundData(
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
      service: "equity-fund",
      timestamp: new Date().toISOString(),
    };
  }
}
