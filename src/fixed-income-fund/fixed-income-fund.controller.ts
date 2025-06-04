import {
  Controller,
  Post,
  Body,
  HttpStatus,
  HttpException,
  Logger,
  Get,
} from "@nestjs/common";
import { FixedIncomeFundService } from "./fixed-income-fund.service";

@Controller("fixed-income-fund")
export class FixedIncomeFundController {
  private readonly logger = new Logger(FixedIncomeFundController.name);

  constructor(
    private readonly fixedIncomeFundService: FixedIncomeFundService
  ) {}

  @Post("submit")
  async submitFixedIncomeFundRedemption(@Body() request: any) {
    try {
      this.logger.log(
        `Received Fixed Income fund redemption for: ${request.formData.fullName}`
      );

      if (!request.formData || !request.pdfContent || !request.adminEmail) {
        throw new HttpException(
          "Missing required fields: formData, pdfContent, and adminEmail are required",
          HttpStatus.BAD_REQUEST
        );
      }

      const validation = this.fixedIncomeFundService.validateFixedIncomeFundData(
        request.formData
      );
      if (!validation.valid) {
        throw new HttpException(
          { message: "Form validation failed", errors: validation.errors },
          HttpStatus.BAD_REQUEST
        );
      }

      const currentDate = Date.now();
      await this.fixedIncomeFundService.sendFixedIncomeFundRedemption(
        request.formData,
        request.pdfContent,
        request.adminEmail,
        currentDate
      );

      if (request.formData.userEmail) {
        await this.fixedIncomeFundService.sendClientConfirmationEmail(
          request.formData,
          request.pdfContent,
          currentDate
        );
      }

      return {
        success: true,
        message: "Fixed Income Fund redemption submitted successfully",
        referenceId: `PACAM-FIXED-INCOME-${currentDate}`,
      };
    } catch (error) {
      this.logger.error(
        "Failed to submit Fixed Income fund redemption",
        error.stack
      );
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        "Internal server error while processing Fixed Income fund redemption",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post("validate")
  async validateFixedIncomeFundData(@Body() request: any) {
    try {
      const validation = this.fixedIncomeFundService.validateFixedIncomeFundData(
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
      service: "fixed-income-fund",
      timestamp: new Date().toISOString(),
    };
  }
}
