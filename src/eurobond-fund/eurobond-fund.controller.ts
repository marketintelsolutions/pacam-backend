import {
  Controller,
  Post,
  Body,
  HttpStatus,
  HttpException,
  Logger,
  Get,
} from "@nestjs/common";
import { EurobondFundService } from "./eurobond-fund.service";

@Controller("eurobond-fund")
export class EurobondFundController {
  private readonly logger = new Logger(EurobondFundController.name);

  constructor(private readonly eurobondFundService: EurobondFundService) {}

  @Post("submit")
  async submitEurobondFundRedemption(@Body() request: any) {
    try {
      this.logger.log(
        `Received Eurobond fund redemption for: ${request.formData.fullName}`
      );

      if (!request.formData || !request.pdfContent || !request.adminEmail) {
        throw new HttpException(
          "Missing required fields: formData, pdfContent, and adminEmail are required",
          HttpStatus.BAD_REQUEST
        );
      }

      const validation = this.eurobondFundService.validateEurobondFundData(
        request.formData
      );
      if (!validation.valid) {
        throw new HttpException(
          { message: "Form validation failed", errors: validation.errors },
          HttpStatus.BAD_REQUEST
        );
      }

      const currentDate = Date.now();
      await this.eurobondFundService.sendEurobondFundRedemption(
        request.formData,
        request.pdfContent,
        request.adminEmail,
        currentDate
      );

      if (request.formData.userEmail) {
        await this.eurobondFundService.sendClientConfirmationEmail(
          request.formData,
          request.pdfContent,
          currentDate
        );
      }

      return {
        success: true,
        message: "Eurobond Fund redemption submitted successfully",
        referenceId: `PACAM-EUROBOND-${currentDate}`,
      };
    } catch (error) {
      this.logger.error(
        "Failed to submit Eurobond fund redemption",
        error.stack
      );
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        "Internal server error while processing Eurobond fund redemption",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post("validate")
  async validateEurobondFundData(@Body() request: any) {
    try {
      const validation = this.eurobondFundService.validateEurobondFundData(
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
      service: "eurobond-fund",
      timestamp: new Date().toISOString(),
    };
  }
}
