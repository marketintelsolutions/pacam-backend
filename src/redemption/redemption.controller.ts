// src/redemption/redemption.controller.ts
import {
  Controller,
  Post,
  Body,
  HttpStatus,
  HttpException,
  Logger,
  Get,
} from "@nestjs/common";
import { EmailService } from "../email/email.service";
import { RedemptionService } from "./redemption.service";
import { SubmitRedemptionRequest } from "../types/redemption.types";

@Controller("redemption")
export class RedemptionController {
  private readonly logger = new Logger(RedemptionController.name);

  constructor(
    private readonly emailService: EmailService,
    private readonly redemptionService: RedemptionService
  ) {}

  @Post("submit")
  async submitRedemptionForm(@Body() request: SubmitRedemptionRequest) {
    try {
      this.logger.log(
        `Received redemption submission for client: ${request.formData.clientId}`
      );

      // Validate request structure
      if (
        !request.formData ||
        !request.pdfContent ||
        !request.fundManagerEmail
      ) {
        throw new HttpException(
          "Missing required fields: formData, pdfContent, and fundManagerEmail are required",
          HttpStatus.BAD_REQUEST
        );
      }

      // Validate form data
      const validation = this.redemptionService.validateRedemptionData(
        request.formData
      );

      //   console.log(
      //     "formdata",
      //     request.formData,
      //     request.fundManagerEmail,
      //     request.pdfContent
      //   );

      if (!validation.valid) {
        throw new HttpException(
          {
            message: "Form validation failed",
            errors: validation.errors,
          },
          HttpStatus.BAD_REQUEST
        );
      }

      const currentDate = Date.now();

      // Send email
      await this.emailService.sendRedemptionForm(
        request.formData,
        request.pdfContent,
        request.fundManagerEmail,
        currentDate
      );
      await this.emailService.sendClientConfirmationEmail(
        request.formData,
        request.pdfContent,
        currentDate
      );

      return {
        success: true,
        message: "Redemption form submitted successfully",
        referenceId: `PACAM-${currentDate}`,
      };
    } catch (error) {
      this.logger.error("Failed to submit redemption form", error.stack);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        "Internal server error while processing redemption",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get("health")
  healthCheck() {
    return {
      status: "ok",
      service: "redemption",
      timestamp: new Date().toISOString(),
    };
  }
}
