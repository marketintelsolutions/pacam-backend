// src/email-indemnity/email-indemnity.controller.ts
import {
  Controller,
  Post,
  Body,
  HttpStatus,
  HttpException,
  Logger,
  Get,
} from "@nestjs/common";
import { EmailIndemnityService } from "./email-indemnity.service";
import { EmailTemplateService } from "../email/email-template.service";
import { SubmitEmailIndemnityRequest } from "../types/email-indemnity.types";

@Controller("email-indemnity")
export class EmailIndemnityController {
  private readonly logger = new Logger(EmailIndemnityController.name);

  constructor(
    private readonly emailIndemnityService: EmailIndemnityService,
    private readonly emailTemplateService: EmailTemplateService
  ) {}

  @Post("submit")
  async submitEmailIndemnityForm(@Body() request: SubmitEmailIndemnityRequest) {
    try {
      this.logger.log(
        `Received email indemnity submission for: ${request.formData.accountHolderName}`
      );

      // Validate request structure
      if (!request.formData || !request.pdfContent || !request.adminEmail) {
        throw new HttpException(
          "Missing required fields: formData, pdfContent, and adminEmail are required",
          HttpStatus.BAD_REQUEST
        );
      }

      // Validate form data
      const validation = this.emailIndemnityService.validateEmailIndemnityData(
        request.formData
      );

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

      // Send emails
      await this.emailIndemnityService.sendEmailIndemnityForm(
        request.formData,
        request.pdfContent,
        request.adminEmail,
        currentDate
      );

      // Send confirmation to user if email provided
      if (request.formData.preferredEmail) {
        await this.emailIndemnityService.sendClientConfirmationEmail(
          request.formData,
          request.pdfContent,
          currentDate
        );
      }

      return {
        success: true,
        message: "Email Indemnity Agreement submitted successfully",
        referenceId: `PACAM-INDEMNITY-${currentDate}`,
      };
    } catch (error) {
      this.logger.error("Failed to submit email indemnity form", error.stack);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        "Internal server error while processing email indemnity agreement",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get("health")
  healthCheck() {
    return {
      status: "ok",
      service: "email-indemnity",
      timestamp: new Date().toISOString(),
    };
  }
}
